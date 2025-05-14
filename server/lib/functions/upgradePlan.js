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
exports.upgradePlan = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Upgrade a user's plan to pro
 * This would typically involve processing payment via a payment processor like Stripe
 */
exports.upgradePlan = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = context.auth.uid;
    const { paymentToken } = data;
    if (!paymentToken) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment token is required');
    }
    // In a real implementation, you would process the payment here
    // For example, using Stripe to charge the customer
    // This is just a placeholder for demonstration purposes
    try {
        // Update the user's plan in Firestore
        await db.collection('users').doc(uid).set({
            plan: 'pro',
            upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
            cardLimit: 10
        }, { merge: true });
        // Return the updated plan info
        return {
            plan: 'pro',
            cardLimit: 10,
            success: true,
            message: 'Plan upgraded successfully'
        };
    }
    catch (error) {
        console.error('Error upgrading plan:', error);
        throw new functions.https.HttpsError('internal', 'Failed to upgrade plan');
    }
});
//# sourceMappingURL=upgradePlan.js.map