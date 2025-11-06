import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
    return Promise.reject(error);
  }
);

// ==================== 用户相关 API ====================

export interface UserInfo {
  userId: string;
  name: string;
  email?: string;
  preferences: {
    selectedAvatar: string;
    theme: string;
    language: string;
  };
}

export const userAPI = {
  // 注册或登录
  register: async (userId: string, name?: string, email?: string) => {
    const response = await apiClient.post('/user/register', { userId, name, email });
    const { user, token } = response.data;
    
    // 保存 token 和 userId
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user.userId);
    
    return user;
  },

  // 获取用户信息
  getUser: async (userId: string): Promise<UserInfo> => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  // 更新用户信息
  updateUser: async (userId: string, data: Partial<UserInfo>) => {
    const response = await apiClient.put(`/user/${userId}`, data);
    return response.data;
  },

  // 更新 API Key
  updateApiKey: async (userId: string, provider: string, apiKey: string) => {
    const response = await apiClient.put(`/user/${userId}/apikey`, { provider, apiKey });
    return response.data;
  },

  // 获取 API Key
  getApiKey: async (userId: string, provider: string): Promise<string> => {
    const response = await apiClient.get(`/user/${userId}/apikey/${provider}`);
    return response.data.apiKey;
  },
};

// ==================== 记忆相关 API ====================

export interface Memory {
  _id: string;
  userId: string;
  type: 'conversation' | 'user_info' | 'preference' | 'note';
  content: string;
  metadata: {
    tags?: string[];
    importance?: number;
    context?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

export const memoryAPI = {
  // 创建记忆
  create: async (memory: Omit<Memory, '_id' | 'createdAt'>): Promise<Memory> => {
    const response = await apiClient.post('/memory', memory);
    return response.data;
  },

  // 获取记忆列表
  list: async (userId: string, type?: string, limit = 50, skip = 0) => {
    const response = await apiClient.get(`/memory/${userId}`, {
      params: { type, limit, skip },
    });
    return response.data;
  },

  // 搜索记忆
  search: async (userId: string, query: string, type?: string) => {
    const response = await apiClient.get(`/memory/${userId}/search`, {
      params: { q: query, type },
    });
    return response.data;
  },

  // 删除记忆
  delete: async (memoryId: string) => {
    const response = await apiClient.delete(`/memory/${memoryId}`);
    return response.data;
  },

  // 批量删除
  batchDelete: async (ids: string[]) => {
    const response = await apiClient.post('/memory/batch-delete', { ids });
    return response.data;
  },
};

// ==================== 对话相关 API ====================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const conversationAPI = {
  // 创建对话
  create: async (userId: string, title?: string): Promise<Conversation> => {
    const response = await apiClient.post('/conversation', { userId, title });
    return response.data;
  },

  // 获取对话列表
  list: async (userId: string, limit = 20, skip = 0) => {
    const response = await apiClient.get(`/conversation/${userId}`, {
      params: { limit, skip },
    });
    return response.data;
  },

  // 获取对话详情
  getDetail: async (conversationId: string): Promise<Conversation> => {
    const response = await apiClient.get(`/conversation/detail/${conversationId}`);
    return response.data;
  },

  // 添加消息
  addMessage: async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const response = await apiClient.post(`/conversation/${conversationId}/message`, {
      role,
      content,
    });
    return response.data;
  },

  // 更新标题
  updateTitle: async (conversationId: string, title: string) => {
    const response = await apiClient.put(`/conversation/${conversationId}/title`, { title });
    return response.data;
  },

  // 删除对话
  delete: async (conversationId: string) => {
    const response = await apiClient.delete(`/conversation/${conversationId}`);
    return response.data;
  },
};

// ==================== AI 相关 API ====================

export const aiAPI = {
  // 聊天补全
  chat: async (
    messages: Message[],
    userId?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) => {
    const response = await apiClient.post('/ai/chat', {
      messages,
      userId,
      stream: false,
      options,
    });
    return response.data;
  },

  // 流式聊天
  chatStream: async (
    messages: Message[],
    userId?: string,
    onChunk?: (content: string) => void,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'x-user-id': localStorage.getItem('userId') || '',
      },
      body: JSON.stringify({
        messages,
        userId,
        stream: true,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error('Stream request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return fullContent;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                onChunk?.(parsed.content);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }

    return fullContent;
  },

  // 测试 API Key
  testApiKey: async (apiKey: string): Promise<boolean> => {
    const response = await apiClient.post('/ai/test-key', { apiKey });
    return response.data.valid;
  },
};

export default apiClient;

