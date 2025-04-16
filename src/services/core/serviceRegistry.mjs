// Core infrastructure services
import { SchedulingService } from '../scheduler/scheduler.mjs';
import { DatabaseService } from '../foundation/databaseService.mjs';
import { ConfigService } from '../foundation/configService.mjs';

// Security and moderation services
import { SpamControlService } from '../security/spamControlService.mjs';
import { RiskManagerService } from '../security/riskManagerService.mjs';
import { ModerationService } from '../security/moderationService.mjs';

// AI and prompt services
import { AIServiceClass } from '../ai/aiService.mjs';
import { PromptService } from '../ai/promptService.mjs';

// Entity and domain services
import { AvatarService } from '../entity/avatarService.mjs';
import { MemoryService } from '../entity/memoryService.mjs';
import { SchemaService } from '../entity/schemaService.mjs';
import { KnowledgeService } from '../entity/knowledgeService.mjs';

// Item and stat services
import { ItemService } from '../item/itemService.mjs';
import { StatService } from '../battle/statService.mjs';
import { DiceService } from '../battle/diceService.mjs';
import { BattleService } from '../battle/battleService.mjs';

// Map and location services
import { MapService } from '../map/mapService.mjs';
import { LocationService } from '../location/locationService.mjs';

// Media and storage services
import { ImageProcessingService } from '../media/imageProcessingService.mjs';
import { S3Service } from '../s3/s3Service.mjs';
import { ArweaveService } from '../arweave/arweaveService.mjs';

// Social and communication services
import { DiscordService } from '../social/discordService.mjs';
import { MessageHandler } from '../chat/messageHandler.mjs';
import { ChannelManager } from '../chat/channelManager.mjs';
import { ConversationManager } from '../chat/conversationManager.mjs';
import { DecisionMaker } from '../chat/decisionMaker.mjs';
import * as xService from '../social/xService.mjs';

// Tools and user profile services
import { ToolService } from '../tools/ToolService.mjs';
import { UserProfileService } from '../userProfileService.mjs';

// Web service
import { WebService } from '../web/webService.mjs';

// Client Services
import { OneirocomForumService } from '../oneirocom/OneirocomForumService.mjs';
import { BasicService } from '../foundation/basicService.mjs';
import { aiModelService } from '../ai/aiModelService.mjs';

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

infrastructure.userProfileService = new UserProfileService({
  databaseService: infrastructure.databaseService
});

// Domain layer
const domain = {};

domain.discordService = new DiscordService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  databaseService: infrastructure.databaseService,
});


if (process.env.ONEIROCOM_FORUM_API_KEY
  && process.env.ONEIROCOM_FORUM_API_URI) {
  domain.forumClientService = new OneirocomForumService({
    logger: infrastructure.logger,
    configService: infrastructure.configService,
  });
}

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

domain.aiModelService = aiModelService;

domain.aiService = new AIServiceClass({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  s3Service: infrastructure.s3Service,
  aiModelService: domain.aiModelService,
});

domain.mapService = new MapService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  discordService: domain.discordService,
});

domain.schemaService = new SchemaService({
  logger: infrastructure.logger,
  aiService: domain.aiService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  s3Service: infrastructure.s3Service,
});

domain.itemService = new ItemService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  discordService: domain.discordService,
  schemaService: domain.schemaService,
});

domain.statService = new StatService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
});

domain.avatarService = new AvatarService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  aiService: domain.aiService,
  schedulingService: infrastructure.schedulingService,
  mapService: domain.mapService,
  statService: domain.statService,
  schemaService: domain.schemaService,
  imageProcessingService: infrastructure.imageProcessingService,
  discordService: domain.discordService,
  memoryService: domain.memoryService,
  riskManagerService: domain.riskManagerService
});
domain.diceService = new DiceService();
domain.battleService = new BattleService({
  avatarService: domain.avatarService,
  statService: domain.statService,
  mapService: domain.mapService,
  diceService: domain.diceService,
  databaseService: infrastructure.databaseService,
  conversationManager: domain.conversationManager,
});

domain.memoryService = new MemoryService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
  databaseService: infrastructure.databaseService,
  discordService: domain.discordService,
  schemaService: domain.schemaService,
});

domain.knowledgeService = new KnowledgeService({
  logger: infrastructure.logger,
  databaseService: infrastructure.databaseService,
  schemaService: domain.schemaService,
});


domain.promptService = new PromptService({
  logger: infrastructure.logger,
  discordService: domain.discordService,
  databaseService: infrastructure.databaseService,
  configService: infrastructure.configService,
  mapService: domain.mapService,
  itemService: domain.itemService,
  memoryService: domain.memoryService,
  userProfileService: infrastructure.userProfileService,
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
  schemaService: domain.schemaService,
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

domain.xService = new xService.XService({
  logger: infrastructure.logger,
  configService: infrastructure.configService,
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
  schemaService: domain.schemaService,
  promptService: domain.promptService,
  memoryService: domain.memoryService,
  locationService: domain.locationService,
  mapService: domain.mapService,
  aiService: domain.aiService,
  itemService: domain.itemService,
  riskManagerService: domain.riskManagerService,
  statService: domain.statService,
  knowledgeService: domain.knowledgeService,
  battleService: domain.battleService,
  s3Service: infrastructure.s3Service,
  xService: domain.xService,
  imageProcessingService: infrastructure.imageProcessingService,
  forumClientService: domain.forumClientService,
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
  schemaService: domain.schemaService,
  promptService: domain.promptService,
  memoryService: domain.memoryService,
  locationService: domain.locationService,
  mapService: domain.mapService,
  aiService: domain.aiService,
  itemService: domain.itemService,
  riskManagerService: domain.riskManagerService,
  moderationService: domain.moderationService,
  mapService: domain.mapService,
});

if(domain.forumClientService) {
  domain.toolService.forumClientService = domain.forumClientService;
}
domain.promptService.toolService = domain.toolService;
domain.messageHandler.toolService = domain.toolService;
domain.moderationService.toolService = domain.toolService;
domain.conversationManager.toolService = domain.toolService;

domain.webService = new WebService({
  ...infrastructure,
  ...domain,
});


// Validate service dependencies

try {
  BasicService.validateServiceDependencies({
    ...infrastructure,
    ...domain,
  });

  domain.toolService.initialize();
} catch (error) {
  infrastructure.logger.error(`[ServiceRegistry] Service dependency validation failed: ${error.message}`);
  throw error;
}


// Compose services object
const services = {
  ...infrastructure,
  ...domain,
};


export { services };
