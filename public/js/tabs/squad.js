export async function loadSquad() {
  const content = document.getElementById("content");
  const state = window.state || {};
  if (!state.wallet) {
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="mb-4">Connect your wallet to view your Squad</p>
        <button class="px-4 py-2 bg-blue-600 rounded" onclick="connectWallet()">Connect Wallet</button>
      </div>`;
    return;
  }
  try {
    const response = await fetch(`/api/avatars?walletAddress=${state.wallet.publicKey}`);
    const data = await response.json();
    if (!data.avatars || data.avatars.length === 0) {
      content.innerHTML = '<div class="text-center py-12">No Squad members found</div>';
      return;
    }
    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${data.avatars.map(avatar => `
          <div class="bg-gray-800 p-4 rounded-lg">
            <h3 class="text-lg font-bold">${avatar.name}</h3>
            <p>${avatar.description}</p>
          </div>
        `).join("")}
      </div>`;
  } catch (err) {
    console.error("Load Squad error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load Squad: ${err.message}</div>`;
  }
}
