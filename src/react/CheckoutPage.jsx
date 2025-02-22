
import React from 'react';
import ReactDOM from 'react-dom';

function CheckoutPage() {
  React.useEffect(() => {
    window.location.href = 'https://staging.crossmint.com/collections/rati-moonstone-sanctum/drop';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Redirecting to checkout...</div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('root');
ReactDOM.render(<CheckoutPage />, root);
