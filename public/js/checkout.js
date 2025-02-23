const root = ReactDOM.createRoot(document.getElementById('root'));
const urlParams = new URLSearchParams(window.location.search);
const avatarId = urlParams.get("avatarId");
const templateId = urlParams.get("templateId");
const collectionId = urlParams.get("collectionId");

fetch(`/api/avatars/${avatarId}`)
  .then((res) => res.json())
  .then((avatar) => {
    function CheckoutPage() {
      return React.createElement(CrossmintProvider, 
        { apiKey: process.env.CROSSMINT_CLIENT_API_KEY },
        React.createElement(CrossmintCheckoutProvider, null,
          React.createElement(CrossmintHostedCheckout, {
            lineItems: {
              collectionLocator: `crossmint:${collectionId}:${templateId}`,
              callData: {
                totalPrice: "0.001",
                quantity: 1,
                templateId: templateId,
                avatarId: avatar._id
              }
            },
            appearance: {
              theme: {
                button: "dark",
                checkout: "dark"
              }
            },
            payment: {
              crypto: {
                enabled: true,
                defaultChain: "polygon"
              },
              fiat: {
                enabled: true,
                defaultCurrency: "usd"
              }
            }
          })
        )
      );
    }

    root.render(React.createElement(CheckoutPage));
  })
  .catch((err) => console.error("Error fetching avatar:", err));