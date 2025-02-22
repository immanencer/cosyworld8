"use client";

import { useEffect } from 'react';

export default function CheckoutPage() {
  useEffect(() => {
    window.location.href = 'https://staging.crossmint.com/collections/rati-moonstone-sanctum/drop';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Redirecting to checkout...</div>
    </div>
  );
}