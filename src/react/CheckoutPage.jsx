
import React from 'react';
import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const collectionId = params.get("collectionId");
  const clientId = window.CROSSMINT_CLIENT_API_KEY;

  if (!clientId) {
    return <div>Missing API key</div>;
  }

  if (!templateId || !collectionId) {
    return <div>Missing template or collection ID</div>;
  }

  return (
    <div>
      <h1>NFT Checkout</h1>
      <CrossmintProvider apiKey={clientId}>
        <CrossmintEmbeddedCheckout
          clientId={clientId}
          environment="staging"
          lineItems={{
            collectionLocator: `crossmint:${collectionId}:${templateId}`,
            callData: {
              totalPrice: "0.001",
              quantity: 1
            }
          }}
        />
      </CrossmintProvider>
    </div>
  );
}

export default CheckoutPage;
