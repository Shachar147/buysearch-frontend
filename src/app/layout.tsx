import '../app/app.css';
import type { ReactNode } from 'react';
import AuthGuard from '../components/auth-guard';

export const metadata = {
  title: 'BuySearch',
  description: 'Product search and filtering app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
