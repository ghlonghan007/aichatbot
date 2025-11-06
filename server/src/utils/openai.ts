import OpenAI from 'openai';
import { decrypt } from './encryption.js';

const DEFAULT_API_KEY = process.env.DEFAULT_OPENAI_KEY;

/**
 * 创建 OpenAI 客户端
 */
export function createOpenAIClient(apiKey?: string): OpenAI {
  const key = apiKey || DEFAULT_API_KEY;
  
  if (!key) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: key,
  });
}

/**
 * 聊天补全
 */
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiKey?: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  try {
    const client = createOpenAIClient(apiKey);
    
    const response = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error');
    }
    
    throw new Error(error.message || 'Failed to generate response');
  }
}

/**
 * 流式聊天补全
 */
export async function* chatCompletionStream(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiKey?: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  try {
    const client = createOpenAIClient(apiKey);
    
    const stream = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error('OpenAI streaming error:', error);
    throw new Error(error.message || 'Failed to stream response');
  }
}

/**
 * 测试 API Key 是否有效
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = createOpenAIClient(apiKey);
    await client.models.list();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 生成对话标题
 */
export async function generateConversationTitle(
  firstMessage: string,
  apiKey?: string
): Promise<string> {
  try {
    const result = await chatCompletion(
      [
        {
          role: 'system',
          content: '用简短的 5-8 个字总结下面的对话主题，只返回标题，不要引号。',
        },
        {
          role: 'user',
          content: firstMessage,
        },
      ],
      apiKey,
      { model: 'gpt-3.5-turbo', temperature: 0.5, maxTokens: 20 }
    );

    return result.content.trim() || '新对话';
  } catch (error) {
    return '新对话';
  }
}

