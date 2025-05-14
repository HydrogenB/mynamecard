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
exports.initializeCardLimits = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Cloud function to initialize the card limits configuration in Firestore.
 * This would typically be run once when setting up the system.
 */
exports.initializeCardLimits = functions.https.onRequest(async (req, res) => {
    const db = admin.firestore();
    try {
        // Create or update the card_limits document
        await db.collection('system_config').doc('card_limits').set({
            free: 2,
            pro: 10,
        });
        res.status(200).json({ success: true, message: 'Card limits initialized' });
    }
    catch (error) {
        console.error('Error initializing card limits:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize card limits' });
    }
});
//# sourceMappingURL=initializeCardLimits.js.map