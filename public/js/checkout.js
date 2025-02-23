
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('templateId');
  const collectionId = params.get('collectionId');
  const avatarId = params.get('avatarId');

  if (!templateId || !collectionId || !avatarId) {
    document.getElementById('checkout-container').innerHTML = 
      '<div class="text-red-500">Missing required parameters</div>';
    return;
  }

  const container = document.getElementById('checkout-container');
  
  // Initialize checkout using vanilla SDK
  const { CrossmintEmbeddedCheckout } = window.CrossmintClientSDK;
  CrossmintEmbeddedCheckout.render({
    target: container,
    clientApiKey: process.env.CROSSMINT_CLIENT_API_KEY,
    props: {
      lineItems: {
        collectionLocator: `crossmint:${collectionId}:${templateId}`,
        callData: {
          totalPrice: "0.001",
          quantity: 1,
          avatarId: avatarId
        }
      },
      payment: {
        crypto: { enabled: true },
        fiat: { enabled: true }
      }
    }
  });
});
