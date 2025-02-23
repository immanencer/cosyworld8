
import React, { useState, useEffect } from 'react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";

export default function CheckoutPage() {
  const [nftData, setNftData] = useState({
    name: '',
    image: '',
    description: '',
    attributes: []
  });

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('templateId');
  const collectionId = params.get('collectionId');
  const clientId = process.env.CROSSMINT_CLIENT_API_KEY;

  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId && collectionId && clientId) {
        try {
          console.log('Fetching template data...');
          const response = await fetch(
            `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/templates/${templateId}`,
            {
              headers: {
                'X-API-KEY': clientId,
                'Accept': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`);
          }

          const template = await response.json();
          console.log('Template data:', template);

          setNftData({
            name: template.metadata.name || 'Unnamed NFT',
            image: template.metadata.image,
            description: template.metadata.description || '',
            attributes: template.metadata.attributes || []
          });
        } catch (error) {
          console.error('Error fetching template:', error);
          setNftData({
            name: "Error Loading NFT",
            image: "/images/placeholder.png",
            description: "Could not load NFT data. Please try again.",
            attributes: []
          });
        }
      }
    };

    fetchTemplate();
  }, [templateId, collectionId, clientId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* NFT Preview Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="aspect-square rounded-lg overflow-hidden mb-6">
            <img 
              src={nftData.image} 
              alt={nftData.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{nftData.name}</h1>
          <p className="text-gray-300 mb-4">{nftData.description}</p>
          
          {nftData.attributes?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {nftData.attributes.map((attr, index) => (
                <div key={index} className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-sm">{attr.trait_type}</div>
                  <div className="font-medium">{attr.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Crossmint Button */}
          <div className="mt-6">
            <CrossmintProvider apiKey={clientId}>
              <CrossmintHostedCheckout
                lineItems={{
                  collectionLocator: `crossmint:${collectionId}`,
                  callData: {
                    totalPrice: "0.001",
                    quantity: 1,
                  },
                }}
                payment={{
                  crypto: { enabled: true },
                  fiat: { enabled: true }
                }}
                appearance={{
                  theme: {
                    button: "dark",
                    checkout: "dark"
                  },
                  variables: {
                    colors: {
                      accent: "#4F46E5"
                    }
                  }
                }}
              />
            </CrossmintProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
