import axios from 'axios';

class CrossmintService {
  constructor(apiKey, collectionId) {
    this.apiKey = apiKey || process.env.CROSSMINT_API_KEY;
    this.collectionId = collectionId || process.env.CROSSMINT_COLLECTION_ID;
    this.baseUrl = process.env.CROSSMINT_BASE_URL || 'https://staging.crossmint.com/api/2022-06-09';
  }
  
  async createTemplate(avatarData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/collections/${this.collectionId}/templates`,
        {
          metadata: {
            name: avatarData.name,
            image: avatarData.imageUrl,
            description: avatarData.description || `A unique Cosy World avatar named ${avatarData.name}`,
            attributes: [
              {
                trait_type: "Emoji",
                value: avatarData.emoji || "💼"
              },
              {
                trait_type: "Created",
                value: avatarData.createdAt ? new Date(avatarData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              },
              {
                trait_type: "Rarity",
                value: this.calculateRarity(avatarData)
              }
            ]
          },
          onChain: {
            tokenId: avatarData.tokenId || null // Allow Crossmint to auto-assign if not provided
          },
          supply: {
            limit: 1 // Each avatar is a 1/1
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey
          }
        }
      );
      
      return {
        success: true,
        templateId: response.data.templateId,
        data: response.data
      };
    } catch (error) {
      console.error('Crossmint template creation error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  calculateRarity(avatarData) {
    // Example rarity calculation based on message count
    if (avatarData.messageCount >= 50) return "Legendary";
    if (avatarData.messageCount >= 20) return "Rare";
    if (avatarData.messageCount >= 5) return "Uncommon";
    return "Common";
  }
  
  async mintNFT(templateId, recipientAddress) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/collections/${this.collectionId}/nfts`,
        {
          templateId,
          recipient: `eth:${recipientAddress}`,
          metadata: {}, // No override needed as we're using the template
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey
          }
        }
      );
      
      return {
        success: true,
        mintId: response.data.id,
        data: response.data
      };
    } catch (error) {
      console.error('Crossmint minting error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  async getMintStatus(mintId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/collections/${this.collectionId}/nfts/${mintId}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          }
        }
      );
      
      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Crossmint status check error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

export const crossmintService = new CrossmintService();
export default CrossmintService;
