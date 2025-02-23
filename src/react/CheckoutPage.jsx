import React, { useEffect, useState } from "react";
import {
  CrossmintProvider,
  CrossmintHostedCheckout,
} from "@crossmint/client-sdk-react-ui";

function CheckoutPage() {
  const [avatar, setAvatar] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const avatarId = urlParams.get("avatarId");
  const templateId = urlParams.get("templateId");
  const collectionId = urlParams.get("collectionId");

  useEffect(() => {
    if (avatarId) {
      fetch(`/api/avatars/${avatarId}`)
        .then((res) => res.json())
        .then((data) => setAvatar(data))
        .catch((err) => console.error("Error fetching avatar:", err));
    }
  }, [avatarId]);

  if (!avatar) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Collect {avatar.name}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-64 h-64 object-cover rounded-lg shadow-lg"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{avatar.name}</h2>
              <p className="text-gray-300 mb-4">{avatar.description}</p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Personality</h3>
                <p className="text-gray-300">{avatar.personality}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <CrossmintProvider apiKey={process.env.CROSSMINT_CLIENT_API_KEY}>
              <CrossmintHostedCheckout
                lineItems={{
                  collectionLocator: `crossmint:${collectionId}:${templateId}`,
                  callData: {
                    totalPrice: "0.001",
                    quantity: 1,
                    templateId: ,
                    avatarId: avatarId,
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
                }}
              />
            </CrossmintProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
