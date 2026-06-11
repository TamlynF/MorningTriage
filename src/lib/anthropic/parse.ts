import Anthropic from '@anthropic-ai/sdk'
import { DumpItemType } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function parseDumpItem(rawText: string): Promise<DumpItemType> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Classify the following as one of: task, reply_needed, worry, idea, someday

Only respond with the type, nothing else.

"${rawText}"`,
      },
    ],
  })

  const typeStr = (message.content[0] as { type: string; text: string }).text
    .toLowerCase()
    .trim()
  const validTypes: DumpItemType[] = [
    'task',
    'reply_needed',
    'worry',
    'idea',
    'someday',
  ]
  return validTypes.includes(typeStr as DumpItemType)
    ? (typeStr as DumpItemType)
    : 'task'
}
