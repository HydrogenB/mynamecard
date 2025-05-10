import VCard from 'vcard-creator';
import { CardData } from './ssrService';

export function generateVCard(data: CardData): string {
  const vCard = new VCard();
  
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
    vCard.addAddress(
      undefined, // PO box
      undefined, // Extended
      data.address.street,
      data.address.city,
      data.address.state,
      data.address.postalCode,
      data.address.country
    );
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
