import React from 'react';
import Link from 'next/link';

const Footer = () => (
  <footer style={{ width: '100%', padding: '16px 0', textAlign: 'center', background: 'var(--bs-gray-2)', borderTop: '1px solid var(--bs-gray-3)', position: 'fixed', bottom: 0, left: 0, zIndex: 100 }}>
    <Link href="/status" style={{ color: 'var(--bs-blue-5)', textDecoration: 'underline', fontWeight: 500 }}>
      Status
    </Link>
  </footer>
);

export default Footer; 