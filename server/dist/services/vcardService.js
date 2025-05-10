"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVCard = generateVCard;
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
