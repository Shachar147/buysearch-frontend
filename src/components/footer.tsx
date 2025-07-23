'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => window.location.pathname.includes('/status') ? null : (
  <footer style={{ width: '100%', padding: '16px 0', textAlign: 'center', background: 'var(--bs-gray-2)', borderTop: '1px solid var(--bs-gray-3)', bottom: 0, left: 0, zIndex: 100 }}>
    <Link href="/status" style={{ color: 'var(--bs-black-5)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>
      Status
    </Link>
  </footer>
);

export default Footer; 