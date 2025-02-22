"use client";

import { useEffect, useState } from 'react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";

export default function CheckoutPage() {
  const [templateId, setTemplateId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('templateId');
    const collectionId = params.get('collectionId');

    if (!templateId || !collectionId) {
      setError('No template ID or collection ID provided');
      setLoading(false);
      return;
    }

    // Fetch avatar details (This fetch call might be redundant now that collectionId is passed directly)
    // fetch(`/api/avatars/${templateId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setTemplateId(templateId);
    //     setCollectionId(data.collectionId || process.env.CROSSMINT_COLLECTION_ID);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError(err.message);
    //     setLoading(false);
    //   });
    setTemplateId(templateId);
    setCollectionId(collectionId);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <CrossmintProvider clientId={process.env.CROSSMINT_CLIENT_API_KEY}>
      <div className="flex min-h-screen items-center justify-center">
        <CrossmintHostedCheckout
          projectId={process.env.CROSSMINT_PROJECT_ID}
          collectionId={collectionId}
          templateId={templateId}
          recipientWalletRequired
          className="w-full max-w-xl"
        />
      </div>
    </CrossmintProvider>
  );
}