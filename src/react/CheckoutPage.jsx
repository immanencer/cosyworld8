
import React from "react";
import { createRoot } from "react-dom/client";
import {
  CrossmintProvider,
  CrossmintHostedCheckout,
} from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const collectionId = params.get("collectionId");
  const clientId = window.CROSSMINT_CLIENT_API_KEY;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">NFT Checkout</h1>
            <div className="space-y-4">
              {clientId && templateId && collectionId ? (
                <CrossmintProvider apiKey={clientId}>
                  <CrossmintHostedCheckout
                    clientId={clientId}
                    environment="staging"
                    lineItems={[{
                      collectionLocator: `crossmint:${collectionId}:${templateId}`,
                      callData: {
                        totalPrice: "0.001",
                        quantity: 1
                      }
                    }]}
                    onError={(error) => {
                      if (error.message.includes("must be enabled")) {
                        console.error("Please enable template minting in the console");
                      } else if (error.message.includes("template")) {
                        console.error("Invalid template ID provided");
                      } else {
                        console.error("Minting failed:", error);
                      }
                    }}
                    onSuccess={(data) => {
                      console.log("Minting successful:", data);
                    }}
                    appearance={{
                      theme: {
                        button: "dark",
                        checkout: "dark",
                      },
                      variables: {
                        colors: {
                          accent: "#22d3ee",
                        },
                      },
                      display: "popup",
                      overlay: {
                        enabled: true,
                      },
                    }}
                  />
                </CrossmintProvider>
              ) : (
                <p className="text-red-400">Missing required parameters</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<CheckoutPage />);

export default CheckoutPage;
