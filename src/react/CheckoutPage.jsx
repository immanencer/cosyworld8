
import React from 'react';
import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const collectionId = params.get("collectionId");
  const clientId = window.CROSSMINT_CLIENT_API_KEY;

  if (!clientId || !templateId || !collectionId) {
    return (
      <div className="error">
        Missing required parameters. Please ensure templateId, collectionId and API key are provided.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              NFT Checkout
            </h1>
            <CrossmintProvider apiKey={clientId}>
              <CrossmintEmbeddedCheckout
                lineItems={{
                  collectionLocator: `crossmint:${collectionId}:${templateId}`,
                  callData: {
                    totalPrice: "0.001",
                    quantity: 1
                  }
                }}
                onError={(error) => console.error("Minting failed:", error)}
                onSuccess={(data) => console.log("Success:", data)}
              />
            </CrossmintProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
