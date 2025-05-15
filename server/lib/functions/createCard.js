"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCard = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const slugGenerator_1 = require("../utils/slugGenerator");
// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * CreateCard API - Securely creates cards from the backend
 * This avoids permission issues with direct frontend access to Firestore
 */
exports.createCard = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to create a card');
    }
    const userId = context.auth.uid;
    try {
        // Get the user document to check card limits
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        let userData;
        // If user profile doesn't exist, create one
        if (!userDoc.exists) {
            console.log('User profile does not exist. Creating...');
            userData = {
                uid: userId,
                email: context.auth.token.email || '',
                displayName: context.auth.token.name || '',
                photoURL: context.auth.token.picture || '',
                plan: 'free',
                cardLimit: 2, // Default free plan limit
                cardsCreated: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await userRef.set(userData);
            console.log('Created new user profile for', userId);
        }
        else {
            userData = userDoc.data();
        }
        // Get card limits from system config
        const limitsRef = db.collection('system_config').doc('card_limits');
        const limitsDoc = await limitsRef.get();
        let cardLimit = 2; // Default free plan limit
        if (limitsDoc.exists) {
            const limits = limitsDoc.data();
            const userPlan = userData.plan || 'free';
            cardLimit = limits[userPlan] || 2;
        }
        else {
            // Create card limits if they don't exist
            await limitsRef.set({
                free: 2,
                pro: 999,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        // Check if user has reached their card limit
        const cardsCreated = userData.cardsCreated || 0;
        if (cardsCreated >= cardLimit) {
            throw new functions.https.HttpsError('resource-exhausted', 'Card limit reached. Please upgrade your plan to create more cards.');
        }
        // Generate slug if not provided
        let slug = data.slug;
        if (!slug && data.firstName && data.lastName) {
            slug = (0, slugGenerator_1.generateSlug)(data.firstName, data.lastName);
        }
        // Check if slug is already in use
        const slugQuery = await db.collection('cards')
            .where('slug', '==', slug)
            .limit(1)
            .get();
        if (!slugQuery.empty) {
            // If slug exists, append a random number
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }
        // Create the card document
        const cardData = Object.assign(Object.assign({}, data), { slug,
            userId, active: true, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        const cardRef = db.collection('cards').doc();
        await cardRef.set(cardData);
        // Increment the user's card count
        await userRef.update({
            cardsCreated: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Create a card stats document
        await db.collection('cardStats').doc(cardRef.id).set({
            views: 0,
            downloads: 0,
            shares: 0,
            userId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Return the created card ID and slug
        return {
            success: true,
            cardId: cardRef.id,
            slug: slug
        };
    }
    catch (error) {
        console.error('Error creating card:', error);
        throw new functions.https.HttpsError('internal', `Failed to create card: ${error.message}`, error);
    }
});
//# sourceMappingURL=createCard.js.map