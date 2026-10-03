import type { Metadata } from 'next';
import { Signika } from 'next/font/google';
import './globals.css';

const signika = Signika({ variable: '--font-signika', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pettycakes.naveedse.chatgpt.site'),
  title: 'PettyCakes | Cakes made for celebrating',
  description: 'Browse handcrafted PettyCakes favourites and order a cake made for your celebration.',
  openGraph: {
    title: 'PettyCakes | Cakes made for celebrating',
    description: 'Browse handcrafted favourites and order a cake made for your celebration.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={signika.variable}>{children}</body></html>;
}
