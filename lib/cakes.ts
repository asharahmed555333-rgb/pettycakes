// Update cake details, sample prices, currency, and image URLs here.
export const CURRENCY = '$';

export const cakes = [
  {
    id: 'chocolate-fudge',
    name: 'Chocolate Fudge',
    description: 'Deep cocoa sponge layered with silky fudge frosting and a glossy chocolate finish.',
    price: 42,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=86',
    alt: 'Rich chocolate layer cake with chocolate frosting',
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet',
    description: 'Velvety cocoa layers paired with a light, tangy cream cheese frosting.',
    price: 46,
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=86',
    alt: 'Red velvet cake with cream cheese frosting',
  },
  {
    id: 'vanilla-celebration',
    name: 'Vanilla Celebration',
    description: 'Fluffy vanilla sponge, cloud-soft buttercream, and cheerful celebration sprinkles.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1000&q=86',
    alt: 'Vanilla celebration cake with festive decorations',
  },
  {
    id: 'strawberry-cream',
    name: 'Strawberry Cream',
    description: 'Tender vanilla layers filled with fresh strawberry flavour and whipped cream.',
    price: 44,
    image: 'https://images.unsplash.com/photo-1579356094148-9b74dab60f5b?auto=format&fit=crop&w=1000&q=86',
    alt: 'Cream cake topped with fresh strawberries',
  },
  {
    id: 'black-forest',
    name: 'Black Forest',
    description: 'Chocolate sponge, cherry filling, whipped cream, and delicate chocolate shavings.',
    price: 48,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=86',
    alt: 'Black Forest style chocolate and cherry cake',
  },
] as const;

export type CakeId = (typeof cakes)[number]['id'];
