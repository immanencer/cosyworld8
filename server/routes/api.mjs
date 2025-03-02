

// Add a route to clear guild config cache
router.post('/guilds/:guildId/clear-cache', async (req, res) => {
  try {
    const { guildId } = req.params;
    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID is required' });
    }
    
    // Access the configService from global scope
    if (global.configService && global.configService.guildConfigCache) {
      global.configService.guildConfigCache.delete(guildId);
      console.log(`Cleared cache for guild ${guildId}`);
    }
    
    return res.status(200).json({ success: true, message: 'Guild config cache cleared' });
  } catch (error) {
    console.error('Error clearing guild config cache:', error);
    return res.status(500).json({ error: 'Failed to clear guild config cache' });
  }
});
