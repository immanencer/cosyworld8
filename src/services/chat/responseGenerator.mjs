export class ResponseGenerator {
  constructor(decisionMaker, conversationHandler, client, logger) {
    this.decisionMaker = decisionMaker;
    this.conversationHandler = conversationHandler;
    this.client = client;
    this.logger = logger;
  }

  async considerResponse(channel, avatar) {
    const shouldRespond = await this.decisionMaker.shouldRespond(channel, avatar, this.client);
    if (shouldRespond) {
      await this.respondAsAvatar(channel, avatar);
    }
  }

  async respondAsAvatar(channel, avatar) {
    await this.conversationHandler.sendResponse(channel, avatar);
    this.logger.info(`${avatar.name} responded in channel ${channel.id}`);
  }
}