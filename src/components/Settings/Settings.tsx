import React, { useState, useEffect } from 'react';
import { userAPI, memoryAPI, conversationAPI, UserInfo, Memory, Conversation } from '../../lib/api';

type SettingsTab = 'profile' | 'apikey' | 'memory' | 'conversations';

type Props = {
  userId: string;
  onClose: () => void;
};

export default function Settings({ userId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Profile tab state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // API Key tab state
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Memory tab state
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memorySearch, setMemorySearch] = useState('');

  // Conversations tab state
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // 加载用户信息
  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  const loadUserInfo = async () => {
    try {
      const user = await userAPI.getUser(userId);
      setUserInfo(user);
      setName(user.name);
      setEmail(user.email || '');
    } catch (err: any) {
      setError('加载用户信息失败');
    }
  };

  // 加载记忆
  const loadMemories = async () => {
    try {
      setLoading(true);
      const result = await memoryAPI.list(userId);
      setMemories(result.memories);
    } catch (err: any) {
      setError('加载记忆失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载对话列表
  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await conversationAPI.list(userId);
      setConversations(result.conversations);
    } catch (err: any) {
      setError('加载对话列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换标签时加载数据
  useEffect(() => {
    setError('');
    setSuccess('');
    
    if (activeTab === 'memory') {
      loadMemories();
    } else if (activeTab === 'conversations') {
      loadConversations();
    }
  }, [activeTab]);

  // 更新用户资料
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError('');
      await userAPI.updateUser(userId, { name, email });
      setSuccess('资料更新成功！');
      loadUserInfo();
    } catch (err: any) {
      setError(err.response?.data?.error || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新 API Key
  const handleUpdateApiKey = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!openaiKey.trim()) {
        setError('请输入有效的 API Key');
        return;
      }

      await userAPI.updateApiKey(userId, 'openai', openaiKey);
      setSuccess('API Key 已保存！');
      setOpenaiKey('');
      setShowKey(false);
    } catch (err: any) {
      setError(err.response?.data?.error || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除记忆
  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('确定要删除这条记忆吗？')) return;

    try {
      await memoryAPI.delete(memoryId);
      setSuccess('记忆已删除');
      loadMemories();
    } catch (err: any) {
      setError('删除失败');
    }
  };

  // 删除对话
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('确定要删除这个对话吗？')) return;

    try {
      await conversationAPI.delete(conversationId);
      setSuccess('对话已删除');
      loadConversations();
    } catch (err: any) {
      setError('删除失败');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>设置</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#fff', fontSize: '24px' }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          {(['profile', 'apikey', 'memory', 'conversations'] as SettingsTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === tab ? 'rgba(0, 188, 212, 0.3)' : 'transparent',
                borderBottom: activeTab === tab ? '2px solid #00bcd4' : 'none',
                color: activeTab === tab ? '#00bcd4' : '#b0b0b0',
              }}
            >
              {tab === 'profile' && '个人资料'}
              {tab === 'apikey' && 'API 密钥'}
              {tab === 'memory' && '记忆管理'}
              {tab === 'conversations' && '对话历史'}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding: '8px', background: '#d32f2f', borderRadius: '4px', marginBottom: '8px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '8px', background: '#388e3c', borderRadius: '4px', marginBottom: '8px' }}>
            {success}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>用户 ID</label>
                <input type="text" value={userId} disabled style={{ opacity: 0.6 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>昵称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入昵称"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>邮箱（可选）</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入邮箱"
                />
              </div>
              <button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? '保存中...' : '保存资料'}
              </button>
            </div>
          )}

          {/* API Key Tab */}
          {activeTab === 'apikey' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>OpenAI API Key</label>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <div style={{ marginTop: '8px' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={showKey}
                      onChange={(e) => setShowKey(e.target.checked)}
                      style={{ width: 'auto', marginRight: '8px' }}
                    />
                    显示密钥
                  </label>
                </div>
              </div>
              <button onClick={handleUpdateApiKey} disabled={loading}>
                {loading ? '保存中...' : '保存 API Key'}
              </button>
              <div style={{ fontSize: '12px', color: '#b0b0b0' }}>
                <p>💡 提示：</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>API Key 会被加密存储</li>
                  <li>获取 OpenAI API Key: <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: '#00bcd4' }}>platform.openai.com</a></li>
                  <li>如果不设置，将使用系统默认的 API Key（如果有）</li>
                </ul>
              </div>
            </div>
          )}

          {/* Memory Tab */}
          {activeTab === 'memory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  value={memorySearch}
                  onChange={(e) => setMemorySearch(e.target.value)}
                  placeholder="搜索记忆..."
                />
              </div>
              {loading ? (
                <p>加载中...</p>
              ) : memories.length === 0 ? (
                <p style={{ color: '#b0b0b0' }}>暂无记忆</p>
              ) : (
                memories
                  .filter((m) => !memorySearch || m.content.toLowerCase().includes(memorySearch.toLowerCase()))
                  .map((memory) => (
                    <div
                      key={memory._id}
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#00bcd4', marginBottom: '4px' }}>
                          {memory.type} | {new Date(memory.timestamp).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '14px' }}>{memory.content}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(memory._id)}
                        style={{ background: '#d32f2f', padding: '4px 8px' }}
                      >
                        删除
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                <p>加载中...</p>
              ) : conversations.length === 0 ? (
                <p style={{ color: '#b0b0b0' }}>暂无对话历史</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{conv.title}</div>
                      <div style={{ fontSize: '12px', color: '#b0b0b0' }}>
                        更新于 {new Date(conv.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteConversation(conv._id)}
                      style={{ background: '#d32f2f', padding: '4px 8px' }}
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

