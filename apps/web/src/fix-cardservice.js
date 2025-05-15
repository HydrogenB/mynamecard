const fs = require('fs');
const path = require('path');

const content = `// Temporary fixed version of cardService
export const cardService = {
  async getCardById() { return null; },
  async getUserCards() { return []; },
  async getCardBySlug() { return null; },
  async updateCard() { return; },
  async deleteCard() { return; }
};`;

const filePath = path.join(__dirname, 'services', 'cardService.ts');

fs.writeFileSync(filePath, content, 'utf8');
console.log('cardService.ts has been updated successfully!');
