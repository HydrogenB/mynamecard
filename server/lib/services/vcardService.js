"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVCard = generateVCard;
exports.trackVcardDownload = trackVcardDownload;
const vcard_creator_1 = __importDefault(require("vcard-creator"));
function generateVCard(data) {
    const vCard = new vcard_creator_1.default();
    // Set properties according to the vCard RFC 6350 spec
    vCard
        .addName(data.lastName, data.firstName)
        .addCompany(data.organization)
        .addJobtitle(data.title)
        .addEmail(data.email)
        .addPhoneNumber(data.phone, 'CELL');
    if (data.website) {
        vCard.addURL(data.website);
    }
    // Add social media URLs if they exist
    if (data.socialMedia) {
        if (data.socialMedia.linkedin) {
            vCard.addURL(data.socialMedia.linkedin, 'LinkedIn');
        }
        if (data.socialMedia.twitter) {
            vCard.addURL(data.socialMedia.twitter, 'Twitter');
        }
        if (data.socialMedia.facebook) {
            vCard.addURL(data.socialMedia.facebook, 'Facebook');
        }
        if (data.socialMedia.instagram) {
            vCard.addURL(data.socialMedia.instagram, 'Instagram');
        }
    }
    if (data.address) {
        vCard.addAddress(undefined, // PO box
        undefined, // Extended
        data.address.street, data.address.city, data.address.state, data.address.postalCode, data.address.country);
    }
    if (data.photo) {
        // Base64 encoded photo
        vCard.addPhoto(data.photo, 'JPEG');
    }
    if (data.notes) {
        vCard.addNote(data.notes);
    }
    return vCard.getOutput();
}
// Added function to track vCard download analytics
async function trackVcardDownload(cardId, userId) {
    try {
        // Implementation will integrate with Firestore
        // This function will be called after a vCard download happens
        console.log(`Tracking vCard download: cardId=${cardId}, userId=${userId || 'anonymous'}`);
        // In production, this would increment a counter in Firestore
        // and log the download event
        return true;
    }
    catch (error) {
        console.error('Error tracking vCard download:', error);
        return false;
    }
}
//# sourceMappingURL=vcardService.js.map