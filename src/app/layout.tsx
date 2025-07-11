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
      <body>
        <ReactQueryProvider>
          <AuthGuard>{children}</AuthGuard>
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}