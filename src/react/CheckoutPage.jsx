import React from 'react';
import { createRoot } from 'react-dom/client';

function CheckoutPage() {
  React.useEffect(() => {
    window.location.href = "https://staging.crossmint.com/collections/rati-moonstone-sanctum/drop";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Redirecting to checkout...</div>
    </div>
  );
}

// Mount the component
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<CheckoutPage />);