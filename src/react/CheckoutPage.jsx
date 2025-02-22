
import React from 'react';
import { createRoot } from 'react-dom/client';

function CheckoutPage() {
  React.useEffect(() => {
    window.location.href = 'https://staging.crossmint.com/collections/rati-moonstone-sanctum/drop';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Redirecting to checkout...</div>
    </div>
  );
}

// Mount the component
const root = createRoot(document.getElementById('root'));
root.render(<CheckoutPage />);
