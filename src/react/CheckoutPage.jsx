
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('templateId');
  const collectionId = params.get('collectionId');

  if (!templateId || !collectionId) {
    useEffect(() => {
      window.location.href = "https://staging.crossmint.com/collections/rati-moonstone-sanctum/drop";
    }, []);

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Redirecting to checkout...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <CrossmintProvider apiKey={process.env.CROSSMINT_CLIENT_API_KEY}>
        <div className="max-w-[450px] w-full">
          <CrossmintEmbeddedCheckout
            lineItems={{
              collectionLocator: `crossmint:${collectionId}:${templateId}`,
              callData: {
                totalPrice: "0.001",
                quantity: 1,
              },
            }}
            payment={{
              crypto: { enabled: true },
              fiat: { enabled: true },
            }}
          />
        </div>
      </CrossmintProvider>
    </div>
  );
}

// Mount the component
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<CheckoutPage />);
