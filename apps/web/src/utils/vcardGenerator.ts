// This is a client-side implementation of vCard generation
// It creates a vCard format string according to RFC 6350
// https://datatracker.ietf.org/doc/html/rfc6350

import { Card } from '../db/db';

export function generateVCard(card: Card): string {
  let vcard = [];
  
  // Helper function to escape special characters in vCard fields
  const escapeVCardField = (text: string): string => {
    // Escape backslashes, commas, semicolons and newlines as per vCard spec
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };
  
  // Basic vCard format
  vcard.push('BEGIN:VCARD');
  vcard.push('VERSION:3.0');
  
  // Name
  vcard.push(`N:${escapeVCardField(card.lastName)};${escapeVCardField(card.firstName)};;;`);
  vcard.push(`FN:${escapeVCardField(card.firstName)} ${escapeVCardField(card.lastName)}`);
  
  // Organization and title
  if (card.organization) {
    vcard.push(`ORG:${escapeVCardField(card.organization)}`);
  }
  
  if (card.title) {
    vcard.push(`TITLE:${escapeVCardField(card.title)}`);
  }
  
  // Contact information
  if (card.email) {
    vcard.push(`EMAIL;TYPE=INTERNET:${card.email}`); // Email doesn't need escaping
  }
  
  if (card.phone) {
    vcard.push(`TEL;TYPE=CELL:${card.phone}`);
  }
  
  if (card.website) {
    vcard.push(`URL:${card.website}`); // URLs don't need escaping
  }    // Address - only add if there are actual address components
  if (card.address) {
    const { street = '', city = '', state = '', postalCode = '', country = '' } = card.address;
    
    // Only add address if at least one component is non-empty
    if (street || city || state || postalCode || country) {
      vcard.push(`ADR;TYPE=WORK:;;${escapeVCardField(street)};${escapeVCardField(city)};${escapeVCardField(state)};${escapeVCardField(postalCode)};${escapeVCardField(country)}`);
    }
  }
  
  // Photo (if base64 encoded)
  if (card.photo && card.photo.startsWith('data:image')) {
    // Extract base64 data without the prefix
    const photoData = card.photo.split(',')[1];
    vcard.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoData}`);
  }    // Notes
  if (card.notes) {
    vcard.push(`NOTE:${escapeVCardField(card.notes)}`);
  }
    // URL to the card - only include if slug is available
  if (card.slug) {
    // Use the current URL pattern (assuming we're viewing the card when downloading)
    // This ensures we use the correct path format for the application
    const currentPath = window.location.pathname;
    // If we're at /{slug} path format
    if (currentPath.split('/').filter(Boolean).length === 1) {
      vcard.push(`URL:${window.location.origin}/${card.slug}`);
    } else {
      // Default to /card/{slug} format
      vcard.push(`URL:${window.location.origin}/card/${card.slug}`);
    }
  }
  
  // End of vCard
  vcard.push('END:VCARD');
  
  return vcard.join('\n');
}
