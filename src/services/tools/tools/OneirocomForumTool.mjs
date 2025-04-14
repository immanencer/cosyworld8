import { BasicTool } from '../BasicTool.mjs';

export class OneirocomForumTool extends BasicTool {
  constructor(services) {
    super(services);
    this.name = 'forum';
    this.description = 'Interact with the forum: browse recent threads or post a new thread based on channel context.';
    this.emoji = '🛰️';

    this.forumService = services.forumClientService;

    if (!this.forumService) {
      this.logger?.warn('ForumClientService is not initialized. ForumTool will be disabled.');
    }
  }

  async fetchThreads({ category, threadId } = {}) {
    if (!this.forumService) return [];
    return this.forumService.getThreads({ category, threadId });
  }

  async createThread({ agentIdentity, title, content, category, tags = [], classification = 'public' }) {
    if (!this.forumService) throw new Error('ForumClientService is not initialized');
    const payload = {
      title,
      content,
      category,
      tags,
      classification
    };
    return this.forumService.createThread({ agentIdentity, payload });
  }

  async createReply({ agentIdentity, threadId, content, tags = [], classification = 'public' }) {
    if (!this.forumService) throw new Error('ForumClientService is not initialized');
    const payload = {
      threadId,
      content,
      tags,
      classification
    };
    return this.forumService.createReply({ agentIdentity, payload });
  }

  async getAvatarForumState(avatar) {
    if (!avatar.forumState) avatar.forumState = {};
    if (!avatar.forumState.currentThreadId) avatar.forumState.currentThreadId = null;
    if (!avatar.forumState.lastSeen) avatar.forumState.lastSeen = {};
    return avatar.forumState;
  }

  async getToolStatusForAvatar(avatar) {
    if (!this.forumService) return { visible: false, info: '' };
    try {
      const forumState = await this.getAvatarForumState(avatar);
      const threadsData = await this.forumService.getThreads();
      const threads = threadsData?.data || [];

      const currentThread = threads.find(t => t.id === forumState.currentThreadId);

      let info = '';
      if (currentThread) {
        info += `Current thread: ${currentThread.title}\n`;
      }

      // Find threads avatar has posted in with new replies
      const relevantThreads = threads.filter(thread => {
        const avatarPosts = thread.posts.filter(p => p.authorId === avatar._id.toString());
        if (avatarPosts.length === 0) return false;
        const lastSeen = forumState.lastSeen[thread.id] || 0;
        const latestPostTime = Math.max(...thread.posts.map(p => new Date(p.timestamp).getTime()));
        return latestPostTime > lastSeen;
      });

      if (relevantThreads.length > 0) {
        info += 'Threads with new replies:\n';
        info += relevantThreads.map(t => `- ${t.title}`).join('\n');
      }

      return {
        visible: !!currentThread || relevantThreads.length > 0,
        info
      };
    } catch (err) {
      this.logger?.error(`ForumTool status error: ${err.message}`);
      return { visible: false, info: '' };
    }
  }

  async browseThreads(avatar) {
    if (!this.forumService) return [];
    const forumState = await this.getAvatarForumState(avatar);
    const threadsData = await this.forumService.getThreads();
    const threads = threadsData?.data || [];

    const relevantThreads = threads.filter(thread => {
      const avatarPosts = thread.posts.filter(p => p.authorId === avatar._id.toString());
      return avatarPosts.length > 0;
    });

    return relevantThreads.map(t => ({
      id: t.id,
      title: t.title,
      hasNew: Math.max(...t.posts.map(p => new Date(p.timestamp).getTime())) > (forumState.lastSeen[t.id] || 0)
    }));
  }

  async switchThread(avatar, threadId) {
    if (!this.forumService) throw new Error('ForumClientService is not initialized');
    const forumState = await this.getAvatarForumState(avatar);
    forumState.currentThreadId = threadId;
    const now = Date.now();
    forumState.lastSeen[threadId] = now;
    await this.services.avatarService.updateAvatar(avatar);
  }

  async postThread(avatar, agentIdentity, title, content, category, tags = [], classification = 'public') {
    if (!this.forumService) throw new Error('ForumClientService is not initialized');
    const payload = { title, content, category, tags, classification };
    const res = await this.forumService.createThread({ agentIdentity, payload });
    const threadId = res?.data?.id;
    if (threadId) {
      const forumState = await this.getAvatarForumState(avatar);
      forumState.currentThreadId = threadId;
      forumState.lastSeen[threadId] = Date.now();
      await this.services.avatarService.updateAvatar(avatar);
    }
    return res;
  }

  async replyToThread(avatar, agentIdentity, content, tags = [], classification = 'public') {
    if (!this.forumService) throw new Error('ForumClientService is not initialized');
    const forumState = await this.getAvatarForumState(avatar);
    if (!forumState.currentThreadId) throw new Error('No active thread selected');
    const payload = { threadId: forumState.currentThreadId, content, tags, classification };
    const res = await this.forumService.createReply({ agentIdentity, payload });
    forumState.lastSeen[forumState.currentThreadId] = Date.now();
    await this.services.avatarService.updateAvatar(avatar);
    return res;
  }

  async execute(message, params, avatar) {
    try {
      if (!params.length) {
        params = ['browse'];
      }

      const command = params[0].toLowerCase();

      if (command === 'browse') {
        const threadsData = await this.forumService.getThreads();
        const threads = threadsData?.data || [];

        const relevantThreads = threads.filter(thread => {
          const avatarPosts = thread.posts.filter(p => p.authorId === avatar._id.toString());
          return avatarPosts.length > 0;
        });

        if (!relevantThreads.length) return 'No relevant forum threads found.';

        const threadList = relevantThreads.slice(0, 10).map(t => `- ${t.title}`).join('\n');
        return `📡 **Forum Threads**\n${threadList}`;
      }

      if (command === 'post') {
        const context = await this.services.conversationManager.getChannelContext(message.channel.id);
        const systemPrompt = await this.services.promptService.getBasicSystemPrompt(avatar);

        const prompt = `
${systemPrompt}

You are an AI forum agent managing an avatar's forum presence.

Your task is to generate a new forum post based on the following channel context:

${context}

Generate a JSON object with:
- "title": a concise thread title
- "content": the main post content
- "category": a suitable category (e.g., 'general')
- "tags": an array of relevant tags

Only output the JSON object, no commentary.`.trim();

        const schema = {
          name: 'forum-post-generation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              category: { type: 'string' },
              tags: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['title', 'content', 'category', 'tags'],
            additionalProperties: false
          }
        };

        const result = await this.services.schemaService.executePipeline({ prompt, schema });

        const agentIdentity = avatar.agentIdentity || {};
        const res = await this.createThread({
          agentIdentity,
          title: result.title,
          content: result.content,
          category: result.category,
          tags: result.tags
        });

        return `✨ Created forum thread: ${result.title}`;
      }

      return '❌ Unknown command. Use: browse or post';
    } catch (error) {
      return `❌ Error: ${error.message}`;
    }
  }

  async getDescription() {
    return 'Interact with the forum: browse recent threads or post a new thread based on channel context.';
  }

  async getSyntax() {
    return `${this.emoji} ${this.name} [browse|post]`;
  }
}
