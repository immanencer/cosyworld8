import { BasicTool } from '../BasicTool.mjs';

export class OneirocomForumTool extends BasicTool {
  static requiredServices = [
    'avatarService',
    'forumService',
    'schemaService',
    'conversationManager',
    'promptService',
    'databaseService'
  ];
  constructor(services) {
    super(services);
    this.name = 'forum';
    this.description = 'Interact with the forum: browse recent threads or post a new thread based on channel context.';
    this.emoji = '🕸️';
  }

  async fetchThreads({ category, threadId } = {}) {
    if (!this.forumService) return [];
    return this.forumService.getThreads({ category, threadId });
  }

  async createThread({ agentIdentity, title, content, category, tags = [], classification = 'public' }) {
    if (!this.forumService) throw new Error('forumService is not initialized');
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
    if (!this.forumService) throw new Error('forumService is not initialized');
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
        info += relevantThreads.map(t => `- ${t.title}`).join('\n') + '\n';
      }

      // Add recent threads (up to 3, excluding already listed)
      const relevantIds = new Set(relevantThreads.map(t => t.id));
      const sortedThreads = threads.slice().sort((a, b) => {
        const aTime = Math.max(...a.posts.map(p => new Date(p.timestamp).getTime()));
        const bTime = Math.max(...b.posts.map(p => new Date(p.timestamp).getTime()));
        return bTime - aTime;
      });
      const recentThreads = sortedThreads.filter(t => !relevantIds.has(t.id)).slice(0, 3);
      if (recentThreads.length > 0) {
        info += 'Recent Threads:\n';
        info += recentThreads.map(t => `- ${t.title}`).join('\n');
      }

      return {
        visible: !!currentThread || relevantThreads.length > 0 || recentThreads.length > 0,
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

    // Threads avatar has posted in
    const relevantThreads = threads.filter(thread => {
      const avatarPosts = thread.posts.filter(p => p.authorId === avatar._id.toString());
      return avatarPosts.length > 0;
    });

    // If fewer than 3, add up to 3 recent threads (excluding already shown)
    const relevantIds = new Set(relevantThreads.map(t => t.id));
    const sortedThreads = threads.slice().sort((a, b) => {
      const aTime = Math.max(...a.posts.map(p => new Date(p.timestamp).getTime()));
      const bTime = Math.max(...b.posts.map(p => new Date(p.timestamp).getTime()));
      return bTime - aTime;
    });
    const recentThreads = sortedThreads.filter(t => !relevantIds.has(t.id)).slice(0, 3);
    const combined = [...relevantThreads, ...recentThreads];

    // Get avatar's basic prompt
    const promptService = this.promptService;
    const basicPrompt = await promptService.getBasicSystemPrompt(avatar);

    return await Promise.all(combined.map(async t => {
      // Can reply if avatar was not the last to comment
      const lastPost = t.posts[t.posts.length - 1];
      const canReply = lastPost && lastPost.authorId !== avatar._id.toString();
      return {
        id: t.id,
        title: t.title,
        hasNew: Math.max(...t.posts.map(p => new Date(p.timestamp).getTime())) > (forumState.lastSeen[t.id] || 0),
        canReply,
        avatarPrompt: basicPrompt
      };
    }));
  }

  async switchThread(avatar, threadId) {
    if (!this.forumService) throw new Error('forumService is not initialized');
    const forumState = await this.getAvatarForumState(avatar);
    forumState.currentThreadId = threadId;
    const now = Date.now();
    forumState.lastSeen[threadId] = now;
    await this.services.avatarService.updateAvatar(avatar);
  }

  async postThread(avatar, agentIdentity, title, content, category, tags = [], classification = 'public') {
    if (!this.forumService) throw new Error('forumService is not initialized');
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
    if (!this.forumService) throw new Error('forumService is not initialized');
    const forumState = await this.getAvatarForumState(avatar);
    if (!forumState.currentThreadId) throw new Error('No active thread selected');
    const payload = { threadId: forumState.currentThreadId, content, tags, classification };
    const res = await this.forumService.createReply({ agentIdentity, payload });
    forumState.lastSeen[forumState.currentThreadId] = Date.now();
    await this.services.avatarService.updateAvatar(avatar);
    return res;
  }

  async execute(message, params, avatar, guildConfig = {}) {
    try {
      if (!this.forumService) return '-# [ ❌ Error: forumService is not initialized. ]';
      // Unified auto-action: always gather threads and context, let AI choose reply or post
      const forumState = await this.getAvatarForumState(avatar);
      const threadsData = await this.forumService.getThreads();
      const threads = threadsData?.data || [];
      const promptService = this.promptService;
      const db = this.services.databaseService?.getDatabase?.();
      const systemPrompt = promptService ? (await promptService.getFullSystemPrompt(avatar, db)) : '';
      const context = await this.services.conversationManager.getChannelContext(message.channel.id);
      // Prepare thread info for AI
      const threadInfos = threads.map(t => {
        const lastPost = t.posts[t.posts.length - 1];
        const canReply = lastPost && lastPost.authorId !== avatar._id.toString();
        return {
          id: t.id,
          title: t.title,
          canReply,
          lastPostContent: lastPost?.content || '',
          lastPostAuthor: lastPost?.authorId || '',
          postCount: t.posts.length
        };
      });
      // Compose prompt
      const prompt = `
${systemPrompt}

You are an AI forum agent managing an avatar's forum presence.

Here are the most recent forum threads (with canReply flag):
${JSON.stringify(threadInfos, null, 2)}

Channel context:
${context}

Choose ONE action:
- If there is a thread where canReply is true and it is relevant, reply to it. Output: { "action": "reply", "threadId": "...", "content": "..." }
- Otherwise, create a new thread. Output: { "action": "post", "title": "...", "content": "...", "category": "...", "tags": [ ... ] }

Only output the JSON object, no commentary.`.trim();
      const schema = {
        name: 'forum-auto-action',
        strict: true,
        schema: {
          oneOf: [
            {
              type: 'object',
              properties: {
                action: { type: 'string', const: 'reply' },
                threadId: { type: 'string' },
                content: { type: 'string' }
              },
              required: ['action', 'threadId', 'content'],
              additionalProperties: false
            },
            {
              type: 'object',
              properties: {
                action: { type: 'string', const: 'post' },
                title: { type: 'string' },
                content: { type: 'string' },
                category: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['action', 'title', 'content', 'category', 'tags'],
              additionalProperties: false
            }
          ]
        }
      };
      const result = await this.services.schemaService.executePipeline({ prompt, schema });
      const agentIdentity = avatar.agentIdentity || {};
      if (result.action === 'reply') {
        await this.createReply({
          agentIdentity,
          threadId: result.threadId,
          content: result.content
        });
        return `↩️ Replied to thread ${result.threadId}: ${result.content}`;
      } else if (result.action === 'post') {
        await this.createThread({
          agentIdentity,
          title: result.title,
          content: result.content,
          category: result.category,
          tags: result.tags
        });
        return `✨ Created forum thread: ${result.title}`;
      } else {
        return '-# [ ❌ Error: AI did not return a valid action. ]';
      }
    } catch (error) {
      return `-# [ ❌ Error: ${error.message} ]`;
    }
  }

  async getDescription() {
    return 'Interact with the forum: browse recent threads or post a new thread based on channel context.';
  }

  async getSyntax() {
    return `${this.emoji} ${this.name} [browse|post]`;
  }
}
