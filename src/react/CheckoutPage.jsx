
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-75"></div>
        <div className="relative px-4 py-10 bg-black shadow-xl sm:rounded-3xl sm:p-20 border border-cyan-500/20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-8 text-gray-200 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Collect on Base
                </h2>
                {clientId && templateId && collectionId ? (
                  <CrossmintProvider apiKey={clientId}>
                    <CrossmintHostedCheckout
                      lineItems={{
                        collectionLocator: `crossmint:${collectionId}:${templateId}`,
                        callData: {
                          totalPrice: "0.0001",
                          quantity: 1,
                          chain: "base"
                        },
                      }}
                      payment={{
                        crypto: { enabled: true },
                        fiat: { enabled: true },
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
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<CheckoutPage />);
