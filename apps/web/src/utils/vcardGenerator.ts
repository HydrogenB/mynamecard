// This is a client-side implementation of vCard generation
// It creates a vCard format string according to RFC 6350
// https://datatracker.ietf.org/doc/html/rfc6350

import { Card } from '../db/db';

export function generateVCard(card: Card): string {
  let vcard = [];
  
  // Basic vCard format
  vcard.push('BEGIN:VCARD');
  vcard.push('VERSION:3.0');
  
  // Name
  vcard.push(`N:${card.lastName};${card.firstName};;;`);
  vcard.push(`FN:${card.firstName} ${card.lastName}`);
  
  // Organization and title
  if (card.organization) {
    vcard.push(`ORG:${card.organization}`);
  }
  
  if (card.title) {
    vcard.push(`TITLE:${card.title}`);
  }
  
  // Contact information
  if (card.email) {
    vcard.push(`EMAIL;TYPE=INTERNET:${card.email}`);
  }
  
  if (card.phone) {
    vcard.push(`TEL;TYPE=CELL:${card.phone}`);
  }
  
  if (card.website) {
    vcard.push(`URL:${card.website}`);
  }
  
  // Address
  if (card.address) {
    const { street = '', city = '', state = '', postalCode = '', country = '' } = card.address;
    vcard.push(`ADR;TYPE=WORK:;;${street};${city};${state};${postalCode};${country}`);
  }
  
  // Photo (if base64 encoded)
  if (card.photo && card.photo.startsWith('data:image')) {
    // Extract base64 data without the prefix
    const photoData = card.photo.split(',')[1];
    vcard.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoData}`);
  }
  
  // Notes
  if (card.notes) {
    vcard.push(`NOTE:${card.notes}`);
  }
  
  // URL to the card
  vcard.push(`URL:${window.location.origin}/${card.slug}`);
  
  // End of vCard
  vcard.push('END:VCARD');
  
  return vcard.join('\n');
}
