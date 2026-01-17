import { ResearcherOutput, SearchAgentInput } from './types';
import SessionManager from '@/lib/session';
import { classify } from './classifier';
import Researcher from './researcher';
import { getWriterPrompt } from '@/lib/prompts/search/writer';
import { WidgetExecutor } from './widgets';
import { prisma } from '@/lib/db/prisma';
import { TextBlock } from '@/lib/types';

class SearchAgent {
  async searchAsync(session: SessionManager, input: SearchAgentInput) {
    // Check if message already exists
    const exists = await prisma.message.findUnique({
      where: { messageId: input.messageId },
    });

    if (!exists) {
      // Create new message
      await prisma.message.create({
        data: {
          messageId: input.messageId,
          chatId: input.chatId,
          backendId: session.id,
          query: input.followUp,
          status: 'answering',
          responseBlocks: [],
        },
      });
    } else {
      // Delete messages after this one (for regeneration)
      await prisma.message.deleteMany({
        where: {
          chatId: input.chatId,
          createdAt: {
            gt: exists.createdAt,
          },
        },
      });

      // Update existing message
      await prisma.message.update({
        where: { messageId: input.messageId },
        data: {
          status: 'answering',
          backendId: session.id,
          responseBlocks: [],
        },
      });
    }

    const classification = await classify({
      chatHistory: input.chatHistory,
      enabledSources: input.config.sources,
      query: input.followUp,
      llm: input.config.llm,
    });

    const widgetPromise = WidgetExecutor.executeAll({
      classification,
      chatHistory: input.chatHistory,
      followUp: input.followUp,
      llm: input.config.llm,
    }).then((widgetOutputs) => {
      widgetOutputs.forEach((o) => {
        session.emitBlock({
          id: crypto.randomUUID(),
          type: 'widget',
          data: {
            widgetType: o.type,
            params: o.data,
          },
        });
      });
      return widgetOutputs;
    });

    let searchPromise: Promise<ResearcherOutput> | null = null;

    if (!classification.classification.skipSearch) {
      const researcher = new Researcher();
      searchPromise = researcher.research(session, {
        chatHistory: input.chatHistory,
        followUp: input.followUp,
        classification: classification,
        config: input.config,
      });
    }

    const [widgetOutputs, searchResults] = await Promise.all([
      widgetPromise,
      searchPromise,
    ]);

    session.emit('data', {
      type: 'researchComplete',
    });

    const finalContext =
      searchResults?.searchFindings
        .map(
          (f, index) =>
            `<result index=${index + 1} title=${f.metadata.title}>${f.content}</result>`,
        )
        .join('\n') || '';

    const widgetContext = widgetOutputs
      .map((o) => {
        return `<result>${o.llmContext}</result>`;
      })
      .join('\n-------------\n');

    const finalContextWithWidgets = `<search_results note="These are the search results and assistant can cite these">\n${finalContext}\n</search_results>\n<widgets_result noteForAssistant="Its output is already showed to the user, assistant can use this information to answer the query but do not CITE this as a souce">\n${widgetContext}\n</widgets_result>`;

    const writerPrompt = getWriterPrompt(
      finalContextWithWidgets,
      input.config.systemInstructions,
      input.config.mode,
      input.config.sources,
    );
    const answerStream = input.config.llm.streamText({
      messages: [
        {
          role: 'system',
          content: writerPrompt,
        },
        ...input.chatHistory,
        {
          role: 'user',
          content: input.followUp,
        },
      ],
    });

    let responseBlockId = '';

    for await (const chunk of answerStream) {
      if (!responseBlockId) {
        const block: TextBlock = {
          id: crypto.randomUUID(),
          type: 'text',
          data: chunk.contentChunk,
        };

        session.emitBlock(block);

        responseBlockId = block.id;
      } else {
        const block = session.getBlock(responseBlockId) as TextBlock | null;

        if (!block) {
          continue;
        }

        block.data += chunk.contentChunk;

        session.updateBlock(block.id, [
          {
            op: 'replace',
            path: '/data',
            value: block.data,
          },
        ]);
      }
    }

    session.emit('end', {});

    // Update message with final response
    await prisma.message.update({
      where: { messageId: input.messageId },
      data: {
        status: 'completed',
        responseBlocks: session.getAllBlocks() as any,
      },
    });

    // Track search history (optional - for analytics)
    try {
      const chat = await prisma.chat.findUnique({
        where: { id: input.chatId },
        select: { userId: true },
      });

      if (chat?.userId) {
        await prisma.searchHistory.create({
          data: {
            userId: chat.userId,
            query: input.followUp,
            sources: input.config.sources as any,
          },
        });
      }
    } catch (err) {
      // Don't fail if search history tracking fails
      console.warn('Failed to track search history:', err);
    }
  }
}

export default SearchAgent;
