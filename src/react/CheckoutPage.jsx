
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const [avatar, setAvatar] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('templateId');
  const collectionId = params.get('collectionId');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch(`/api/avatars/${templateId}`);
        const data = await response.json();
        setAvatar(data);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    if (templateId) {
      fetchAvatar();
    }
  }, [templateId]);

  if (!templateId || !collectionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white text-xl">No template or collection ID provided</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="max-w-[450px] w-full p-6 bg-gray-800 rounded-xl">
        {avatar && (
          <>
            <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-64 object-cover rounded-lg mb-4"/>
            <h1 className="text-2xl font-bold text-white mb-2">{avatar.name}</h1>
            <p className="text-gray-300 mb-4">{avatar.description}</p>
            <div className="space-y-2 mb-6">
              <div className="text-gray-400">
                <span className="font-semibold text-white">Personality:</span> {avatar.personality}
              </div>
              {avatar.traits && (
                <div className="text-gray-400">
                  <span className="font-semibold text-white">Traits:</span> {avatar.traits}
                </div>
              )}
            </div>
          </>
        )}
        <CrossmintPayButton
          clientId={process.env.CROSSMINT_CLIENT_API_KEY}
          mintConfig={{
            type: "erc-721",
            totalPrice: "0.001",
            quantity: "1",
            collectionLocator: `crossmint:${collectionId}:${templateId}`
          }}
          environment="staging"
          className="w-full"
        />
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<CheckoutPage />);
