import '../app/app.css';
import type { ReactNode } from 'react';
import AuthGuard from '../components/auth-guard';
import ReactQueryProvider from '../components/react-query-provider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Footer from '../components/footer';


export const metadata = {
  title: 'BuySearch',
  description: 'Product search and filtering app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AuthGuard>{children}</AuthGuard>
          <Footer />
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}