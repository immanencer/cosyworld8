import { SchedulingService } from '../scheduler/scheduler.mjs';
import { DatabaseService } from '../foundation/databaseService.mjs';
import { ConfigService } from '../foundation/configService.mjs';
import { SpamControlService } from '../security/spamControlService.mjs';
import { AIService } from '../ai/aiService.mjs';
import { AvatarService } from '../entity/avatarService.mjs';
import { ToolService } from '../tools/ToolService.mjs';
import { MapService } from '../map/mapService.mjs';
import { StatService } from '../tools/statService.mjs';
import { DiscordService } from '../social/discordService.mjs';
import { MessageHandler } from '../chat/messageHandler.mjs';
import { ChannelManager } from '../chat/channelManager.mjs';
import { ConversationManager } from '../chat/conversationManager.mjs';
import { DecisionMaker } from '../chat/decisionMaker.mjs';
import { ItemService } from '../item/itemService.mjs';
import { PromptService } from '../ai/promptService.mjs';
import { MemoryService } from '../entity/memoryService.mjs';
import { WebService } from '../web/webService.mjs';
import { CreationService } from '../entity/creationService.mjs';
import { S3Service } from '../s3/s3Service.mjs';
import { LocationService } from '../location/locationService.mjs';
import { ArweaveService } from '../arweave/arweaveService.mjs';
import { RiskManagerService } from '../security/riskManagerService.mjs';
import { ImageProcessingService } from '../media/imageProcessingService.mjs';
import { ModerationService } from '../security/moderationService.mjs';
import { KnowledgeService } from '../entity/knowledgeService.mjs';

// Client Services
import { OneirocomForumService } from '../oneirocom/OneirocomForumService.mjs';

// Infrastructure layer
const infrastructure = {};

infrastructure.logger = console;

infrastructure.configService = new ConfigService({ logger: infrastructure.logger });

infrastructure.databaseService = new DatabaseService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
});

await infrastructure.databaseService.connect();

infrastructure.configService.db = infrastructure.databaseService.getDatabase();
infrastructure.configService.databaseService = infrastructure.databaseService;

infrastructure.schedulingService = new SchedulingService({ 
  logger: infrastructure.logger
});

infrastructure.s3Service = new S3Service({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
});

infrastructure.arweaveService = new ArweaveService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
});

infrastructure.imageProcessingService = new ImageProcessingService({
  logger: infrastructure.logger,
  aiService: infrastructure.aiService,
});

// Domain layer
const domain = {};

domain.discordService = new DiscordService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  databaseService: infrastructure.databaseService,
});

domain.webService = new WebService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  databaseService: infrastructure.databaseService,
  discordService: domain.discordService,
});

domain.forumClientServiceService = new OneirocomForumService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
});

domain.aiService = new AIService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
});

domain.riskManagerService = new RiskManagerService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
});

domain.spamControlService = new SpamControlService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
});

domain.mapService = new MapService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  discordService: domain.discordService,
});

domain.itemService = new ItemService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  discordService: domain.discordService,
});

domain.statService = new StatService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
});

domain.creationService = new CreationService({
  logger: infrastructure.logger,
  aiService: domain.aiService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  s3Service: infrastructure.s3Service,
});

domain.memoryService = new MemoryService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  databaseService: infrastructure.databaseService,
  discordService: domain.discordService,
  creationService: domain.creationService,
  forumClientServiceService: domain.forumClientServiceService,
});

domain.knowledgeService = new KnowledgeService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  creationService: domain.creationService,
});

domain.avatarService = new AvatarService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  aiService: domain.aiService,
  schedulingService: infrastructure.schedulingService,
  mapService: domain.mapService,
  statService: domain.statService,
  creationService: domain.creationService,
  imageProcessingService: infrastructure.imageProcessingService,
  discordService: domain.discordService,
  memoryService: domain.memoryService,
  riskManagerService: domain.riskManagerService
});

domain.promptService = new PromptService({
  logger: infrastructure.logger,
  discordService: domain.discordService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  mapService: domain.mapService,
  itemService: domain.itemService,
  memoryService: domain.memoryService,
});

domain.decisionMaker = new DecisionMaker({
  logger: infrastructure.logger,
  aiService: domain.aiService,
  discordService: domain.discordService,
  configService: infrastructure.configService,
});

domain.conversationManager = new ConversationManager({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  aiService: domain.aiService,
  discordService: domain.discordService,
  avatarService: domain.avatarService,
  memoryService: domain.memoryService,
  promptService: domain.promptService,
  configService: infrastructure.configService,
  knowledgeService: domain.knowledgeService,
  mapService: domain.mapService,
});

domain.channelManager = new ChannelManager({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  discordService: domain.discordService,
  schedulingService: infrastructure.schedulingService,
  mapService: domain.mapService,
  conversationManager: domain.conversationManager,
});

domain.locationService = new LocationService({
  logger: infrastructure.logger,
  aiService: domain.aiService,
  discordService: domain.discordService,
  databaseService: infrastructure.databaseService,
  creationService: domain.creationService,
  itemService: domain.itemService,
  avatarService: domain.avatarService,
  channelManager: domain.channelManager,
  conversationManager: domain.conversationManager,
  mapService: domain.mapService,
});

domain.avatarService.conversationManager = domain.conversationManager;
domain.channelManager.locationService = domain.locationService;
domain.mapService.locationService = domain.locationService;

domain.moderationService = new ModerationService({
  aiService: domain.aiService,
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  riskManagerService: domain.riskManagerService,
});


domain.toolService = new ToolService({
  logger: infrastructure.logger,
  discordService: domain.discordService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  spamControlService: domain.spamControlService,
  avatarService: domain.avatarService,
  schedulingService: infrastructure.schedulingService,
  decisionMaker: domain.decisionMaker,
  conversationManager: domain.conversationManager,
  channelManager: domain.channelManager,
  creationService: domain.creationService,
  promptService: domain.promptService,
  memoryService: domain.memoryService,
  locationService: domain.locationService,
  mapService: domain.mapService,
  aiService: domain.aiService,
  itemService: domain.itemService,
  riskManagerService: domain.riskManagerService,
  statService: domain.statService,
  knowledgeService: domain.knowledgeService,
});

domain.messageHandler = new MessageHandler({
  logger: infrastructure.logger,
  discordService: domain.discordService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  spamControlService: domain.spamControlService,
  avatarService: domain.avatarService,
  schedulingService: infrastructure.schedulingService,
  decisionMaker: domain.decisionMaker,
  conversationManager: domain.conversationManager,
  channelManager: domain.channelManager,
  creationService: domain.creationService,
  promptService: domain.promptService,
  memoryService: domain.memoryService,
  locationService: domain.locationService,
  mapService: domain.mapService,
  aiService: domain.aiService,
  itemService: domain.itemService,
  riskManagerService: domain.riskManagerService,
  moderationService: domain.moderationService
});

domain.promptService.toolService = domain.toolService;
domain.messageHandler.toolService = domain.toolService;
domain.moderationService.toolService = domain.toolService;
domain.conversationManager.toolService = domain.toolService;

// Compose services object
const services = {
  ...infrastructure,
  ...domain,
};

export { services };
