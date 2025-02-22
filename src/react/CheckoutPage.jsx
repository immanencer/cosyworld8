
import React from 'react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";

export default function CheckoutPage() {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('templateId');
  const collectionId = params.get('collectionId');
  const clientApiKey = process.env.CROSSMINT_CLIENT_API_KEY;

  if (!templateId || !collectionId) {
    return <div className="error">Error: Missing templateId or collectionId</div>;
  }

  return (
    <CrossmintProvider apiKey={clientApiKey}>
      <CrossmintHostedCheckout
        lineItems={{
          collectionLocator: `crossmint:${collectionId}`,
          callData: {
            totalPrice: "0.001",
            quantity: 1,
            templateId,
          },
        }}
        payment={{
          crypto: { enabled: true },
          fiat: { enabled: true },
        }}
      />
    </CrossmintProvider>
  );
}
