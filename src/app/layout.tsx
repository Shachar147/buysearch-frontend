import '../app/app.css';
import type { ReactNode } from 'react';
import AuthGuard from '../components/auth-guard';
import ReactQueryProvider from '../components/react-query-provider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


export const metadata = {
  title: 'BuySearch',
  description: 'Product search and filtering app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* <!-- Open Graph Meta Tags --> */}
      <meta property="og:title" content="Buysearch" />
      <meta property="og:description" content="Search once, buy anywhere!" />
      <meta property="og:image" content="https://buysearch.s3.eu-north-1.amazonaws.com/buysearch-preview.jpg" />
      <meta property="og:url" content="https://buysearch.co" />
      <meta property="og:type" content="website" />
      <body>
        <ReactQueryProvider>
          <AuthGuard>{children}</AuthGuard>
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}