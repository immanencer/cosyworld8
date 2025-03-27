import { AvatarManager } from './avatarManager.mjs';
import { ChannelManager } from './channelManager.mjs';
import { ConversationHandler } from './conversationHandler.mjs';
import { DecisionMaker } from './decisionMaker.mjs';
import { ResponseGenerator } from './responseGenerator.mjs';
import { MessageHandler } from './messageHandler.mjs';
import { PeriodicTaskManager } from './periodicTaskManager.mjs';


export class ChatService {
  constructor(client, db, services = {}) {
    this.client = client;
    this.logger = options.logger || console;
    this.db = db;

    // Initialize dependencies
    this.avatarService = options.avatarService;
    this.aiService = options.aiService;
    this.toolService = options.toolService;
    this.statGenerationService = options.statGenerationService;
    this.imageService = options.imageProcessingService;

    // Initialize core modules
    this.avatarManager = new AvatarManager(db, this.avatarService, this.logger);
    this.channelManager = new ChannelManager(client, this.logger);
    this.decisionMaker = new DecisionMaker(this.aiService, this.logger);
    this.conversationHandler = new ConversationHandler(services);
    this.responseGenerator = new ResponseGenerator(
      this.decisionMaker,
      this.conversationHandler,
      client, this.logger
    );


    this.messageHandler = new MessageHandler({
      client, ...options,
      avatarManager: this.avatarManager,
      channelManager: this.channelManager,
      responseGenerator: this.responseGenerator,
      chatService: this,
      memoryService: this.memoryService,
      avatarService: this.avatarService
    });

    this.periodicTaskManager = new PeriodicTaskManager(
      this.avatarManager,
      this.channelManager,
      this.responseGenerator,
      this.logger
    );


  }

  async start() {
    await this.avatarManager.setupDatabase();
    this.client.on('messageCreate', (message) => this.messageHandler.handleMessage(message));
    this.periodicTaskManager.start();
    this.logger.info('ChatService started.');
  }

  async stop() {
    this.periodicTaskManager.stop();
    this.logger.info('ChatService stopped.');
  }
}