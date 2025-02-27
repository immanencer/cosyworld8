
export const connectWallet = async () => {
  try {
    const phantomProvider = window?.phantom?.solana;
    if (!phantomProvider) {
      throw new Error("Please install the Phantom wallet extension.");
    }
    const resp = await phantomProvider.connect();
    if (!resp?.publicKey) {
      throw new Error("No public key received from Phantom.");
    }
    return { publicKey: resp.publicKey.toString() };
  } catch (err) {
    console.error("Failed to connect wallet:", err);
    throw err;
  }
};
