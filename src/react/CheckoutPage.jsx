import React from "react";
import { createRoot } from "react-dom/client";
import {
  CrossmintProvider,
  CrossmintHostedCheckout,
} from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  // Get query parameters
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const collectionId = params.get("collectionId");

  const clientId = window.CROSSMINT_CLIENT_API_KEY;

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8">
                  Complete Your Purchase on Base
                </h2>
                {clientId && templateId && collectionId ? (
                  <CrossmintProvider apiKey={clientId}>
                    <CrossmintHostedCheckout
                      lineItems={{
                        collectionLocator: `crossmint:${collectionId}:${templateId}`,
                        callData: {
                          totalPrice: "0.0001", // Adjusted for Base
                          quantity: 1,
                        },
                      }}
                      payment={{
                        crypto: { enabled: true },
                        fiat: { enabled: true },
                      }}
                    />
                  </CrossmintProvider>
                ) : (
                  <p>Missing required parameters</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<CheckoutPage />);
