"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
/**
 * Utility function to generate a slug from a first name and last name
 * Used in the createCard function to generate slugs
 */
function generateSlug(firstName, lastName) {
    // Convert to lowercase
    const firstNameLower = (firstName || '').toLowerCase().trim();
    const lastNameLower = (lastName || '').toLowerCase().trim();
    // Replace non-alphanumeric characters with hyphens
    const firstNameSlug = firstNameLower.replace(/[^a-z0-9]/g, '-');
    const lastNameSlug = lastNameLower.replace(/[^a-z0-9]/g, '-');
    // Combine with a hyphen
    let slug = `${firstNameSlug}-${lastNameSlug}`;
    // Replace consecutive hyphens with a single one
    slug = slug.replace(/-+/g, '-');
    // Remove leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
}
//# sourceMappingURL=slugGenerator.js.map