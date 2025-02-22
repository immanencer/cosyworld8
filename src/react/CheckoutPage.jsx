import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  CrossmintProvider,
  CrossmintEmbeddedCheckout,
} from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const collectionId = params.get("collectionId");
  const clientId = window.CROSSMINT_CLIENT_API_KEY;
  const [nftData, setNftData] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId && collectionId && clientId) {
        try {
          const response = await fetch(
            `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/templates/${templateId}`,
            {
              headers: {
                'X-API-KEY': clientId
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch template');
          }

          const template = await response.json();
          setNftData({
            name: template.metadata.name,
            image: template.metadata.image,
            description: template.metadata.description,
            attributes: template.metadata.attributes
          });
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      }
    };

    fetchTemplate();
  }, [templateId, collectionId, clientId]);

  return (
    <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-[#1a1725] shadow-xl sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-200 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Complete Purchase
                </h2>

                {nftData && (
                  <div className="nft-preview mb-8">
                    <img
                      src={nftData.image}
                      alt={nftData.name}
                      className="w-full h-64 object-cover rounded-xl shadow-2xl"
                    />
                    <h3 className="text-xl mt-4 font-semibold text-purple-400">
                      {nftData.name}
                    </h3>
                    <p className="text-gray-200">{nftData.description}</p>
                    {nftData.attributes && (
                      <ul>
                        {nftData.attributes.map((attribute, index) => (
                          <li key={index} className="text-gray-200">
                            {attribute.trait_type}: {attribute.value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {clientId && templateId && collectionId ? (
                  <CrossmintProvider apiKey={clientId}>
                    <CrossmintEmbeddedCheckout
                      lineItems={{
                        collectionLocator: `crossmint:${collectionId}:${templateId}`,
                        callData: {
                          totalPrice: "0.1",
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