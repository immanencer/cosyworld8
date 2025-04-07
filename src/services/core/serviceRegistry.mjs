import { Container } from './container.mjs';
import { BasicService } from '../foundation/basicService2.mjs';
import { SchedulingService } from '../scheduler/scheduler.mjs';
import { DatabaseService } from '../foundation/databaseService.mjs';
import { ConfigService } from '../foundation/configService.mjs';
import { SpamControlService } from '../security/spamControlService.mjs';
import { AIService } from '../ai/aiService.mjs';
import { AvatarService } from '../entity/avatarService.mjs';
import { ToolService } from '../tools/ToolService.mjs';
import { MapService } from '../map/mapService.mjs';
import { StatGenerationService } from '../tools/statGenerationService.mjs';
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
import { MCPClientService } from '../mcp/MCPClientService.mjs';
import { RiskManagerService } from '../security/riskManagerService.mjs';
import { ImageProcessingService } from '../media/imageProcessingService.mjs';

const container = new Container();

// Register logger
container.register('logger', () => console);

// Register BasicService as a test service
container.register('basic', (c) => new BasicService(c));
// Register SchedulingService
container.register('schedulingService', (c) => new SchedulingService(c));

// Register core services
container.register('databaseService', (c) => new DatabaseService(c));
container.register('configService', (c) => new ConfigService(c));
container.register('discordService', (c) => new DiscordService(c));
container.register('webService', (c) => new WebService(c));
container.register('mcpClientService', (c) => new MCPClientService(c));
container.register('s3Service', (c) => new S3Service(c));
container.register('arweaveService', (c) => new ArweaveService(c));
container.register('imageProcessingService', (c) => new ImageProcessingService(c));

// Register AI and security
container.register('aiService', (c) => new AIService(c));
container.register('riskManagerService', (c) => new RiskManagerService(c));
container.register('spamControlService', (c) => new SpamControlService(c));

// Register utility and domain services
container.register('statGenerationService', (c) => new StatGenerationService(c));
container.register('creationService', (c) => new CreationService(c));
container.register('channelManager', (c) => new ChannelManager(c));
container.register('memoryService', (c) => new MemoryService(c));
container.register('itemService', (c) => new ItemService(c));
container.register('decisionMaker', (c) => new DecisionMaker(c));
container.register('mapService', (c) => new MapService(c));
container.register('avatarService', (c) => new AvatarService(c));
container.register('conversationManager', (c) => new ConversationManager(c));
container.register('locationService', (c) => new LocationService(c));
container.register('toolService', (c) => new ToolService(c));
container.register('promptService', (c) => new PromptService(c));
container.register('messageHandler', (c) => new MessageHandler(c));

// Register BasicService again under 'basicService' alias for compatibility
container.register('basicService', (c) => new BasicService(c));

export { container };
