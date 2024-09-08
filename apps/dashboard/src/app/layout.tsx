import Layout from '@/components/layout';

import { ClientProvider } from './client-provider';

import type { Metadata } from 'next';

const brandName = 'Dashboard';

export const metadata: Metadata = {
  title: brandName,
  description: 'Dashboard template by using Next.js app router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>
          <Layout brandName={brandName}>{children}</Layout>
        </ClientProvider>
      </body>
    </html>
  );
}
