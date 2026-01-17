import z from 'zod';
import { ClassifierInput } from './types';
import { classifierPrompt } from '@/lib/prompts/search/classifier';
import formatChatHistoryAsString from '@/lib/utils/formatHistory';

const schema = z.object({
  classification: z.object({
    skipSearch: z
      .boolean()
      .describe('Indicates whether to skip the product search step.'),
    personalSearch: z
      .boolean()
      .describe('Indicates whether to perform a personal search through uploaded documents.'),
    needsClarification: z
      .boolean()
      .optional()
      .describe('If true, the query is too vague/ambiguous and needs clarifying questions before searching. Set to true if query is < 5 words and lacks specific details (e.g., "I want a bag" vs "I want a minimalist leather briefcase for work").'),
  }),
  standaloneFollowUp: z
    .string()
    .describe(
      "A self-contained, context-independent reformulation of the user's question.",
    ),
  clarifyingQuestion: z
    .string()
    .optional()
    .describe('If needsClarification is true, provide a helpful clarifying question to ask the user (e.g., "Are we going for \'Professional Minimalist\' (leather, structured) or \'Urban Explorer\' (techwear, waterproof, modular)?").'),
});

export const classify = async (input: ClassifierInput) => {
  const output = await input.llm.generateObject<typeof schema>({
    messages: [
      {
        role: 'system',
        content: classifierPrompt,
      },
      {
        role: 'user',
        content: `<conversation_history>\n${formatChatHistoryAsString(input.chatHistory)}\n</conversation_history>\n<user_query>\n${input.query}\n</user_query>`,
      },
    ],
    schema,
  });

  return output;
};
