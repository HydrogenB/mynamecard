export interface CardAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  website?: string;
  address?: CardAddress;
  photo?: string;
  notes?: string;
  theme?: string;
  slug?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function renderCardHTML(card: CardData, slug?: string): string {
  // Use card.slug as fallback if slug parameter is not provided
  const cardSlug = slug || card.slug || '';
  
  // Don't render inactive cards - redirect to homepage
  if (card.active === false) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="refresh" content="0;url=/" />
          <title>Redirecting...</title>
        </head>
        <body>
          <p>This card is not active. Redirecting to homepage...</p>
          <script>window.location.href = "/";</script>
        </body>
      </html>
    `;
  }
  
  // Generate Open Graph tags for SEO
  const ogTags = `
    <meta property="og:title" content="${card.firstName} ${card.lastName}" />
    <meta property="og:description" content="${card.title} at ${card.organization}" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="http://localhost:3000/${cardSlug}" />
    ${card.photo ? `<meta property="og:image" content="${card.photo}" />` : ''}
  `;

  // Use the client hydration approach - inject data that will be picked up by the client
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${card.firstName} ${card.lastName} - Digital Card</title>
        ${ogTags}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__INITIAL_CARD_DATA__ = ${JSON.stringify({
            slug,
            data: card
          })};
        </script>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  `;
}
