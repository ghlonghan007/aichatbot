import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import GradientBackground from './components/Layout/GradientBackground';
import ThreeColumnLayout from './components/Layout/ThreeColumnLayout';
import AvatarList, { AvatarItem } from './components/AvatarList/AvatarList';
import Avatar3D from './components/Avatar3D';
import ChatBox, { ChatMessage } from './components/Chat/ChatBox';
import ControlPanel from './components/ControlPanel/ControlPanel';
import Settings from './components/Settings/Settings';
import { speakText, stopSpeaking, isSpeakingSupported } from './lib/tts';
import { useMicrophoneVAD } from './lib/audio';
import { aiAPI, conversationAPI, memoryAPI, userAPI } from './lib/api';

// 从 glbdata 目录自动加载的模型列表
const LOCAL_MODELS = [
  { name: '12', path: '/glbdata/12.glb' },
  { name: '15', path: '/glbdata/15.glb' },
  { name: '2', path: '/glbdata/2.glb' },
  { name: '76', path: '/glbdata/76.glb' },
  { name: 'Camera', path: '/glbdata/Camera_1040g3k831ho4okuc3u7g5n37bpn41rhj25s55s8.glb' },
];

export default function App() {
  // 模型状态
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [customModel, setCustomModel] = useState<THREE.Group | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);

  // TTS 状态
  const [ttsText, setTtsText] = useState('你好，我是你的 3D 助手。');
  const [speaking, setSpeaking] = useState(false);

  // 麦克风状态
  const [micActive, setMicActive] = useState(false);
  const [vadActive, setVadActive] = useState(false);

  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // 用户状态
  const [userId, setUserId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // 初始化用户
  useEffect(() => {
    const initUser = async () => {
      let uid = localStorage.getItem('userId');
      
      if (!uid) {
        // 生成临时用户 ID
        uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          await userAPI.register(uid, '新用户');
        } catch (error) {
          console.error('用户注册失败:', error);
        }
      }
      
      setUserId(uid);
      
      // 添加欢迎消息
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: '你好！我是你的 3D AI 助手，有什么可以帮你的吗？',
        },
      ]);
    };

    initUser();
  }, []);

  const { startMic, stopMic, isActive } = useMicrophoneVAD({
    onSpeechStart: () => {
      setVadActive(true);
      // 说话打断当前 TTS
      if (speaking) {
        stopSpeaking();
        setSpeaking(false);
      }
    },
    onSpeechEnd: () => setVadActive(false),
  });

  useEffect(() => {
    setMicActive(isActive);
  }, [isActive]);

  // 自动加载选中的本地模型
  useEffect(() => {
    const loadLocalModel = async () => {
      setLoadingModel(true);
      try {
        const { loadModel } = await import('./lib/modelLoader');
        const model = await loadModel(LOCAL_MODELS[selectedModelIndex].path);
        setCustomModel(model);
      } catch (error) {
        console.error('加载模型失败:', error);
      } finally {
        setLoadingModel(false);
      }
    };
    loadLocalModel();
  }, [selectedModelIndex]);

  const handleSpeak = useCallback(() => {
    if (!isSpeakingSupported()) return;
    setSpeaking(true);
    speakText(ttsText, () => setSpeaking(false));
  }, [ttsText]);

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  const handleToggleMic = useCallback(() => {
    if (isActive) {
      stopMic();
    } else {
      startMic();
    }
  }, [isActive, startMic, stopMic]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };
    setMessages(prev => [...prev, userMessage]);

    setChatLoading(true);

    try {
      // 创建或使用现有对话
      let conversationId = currentConversationId;
      if (!conversationId) {
        const conversation = await conversationAPI.create(userId);
        conversationId = conversation._id;
        setCurrentConversationId(conversationId);
      }

      // 保存用户消息到对话
      await conversationAPI.addMessage(conversationId, 'user', text);

      // 构建聊天历史
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
        timestamp: new Date(),
      }));

      chatHistory.push({
        role: 'user',
        content: text,
        timestamp: new Date(),
      });

      // 调用 AI API（流式）
      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();
      
      // 添加空的 AI 消息占位符
      setMessages(prev => [...prev, {
        id: aiMessageId,
        sender: 'ai',
        text: '',
      }]);

      await aiAPI.chatStream(
        chatHistory,
        userId,
        (chunk) => {
          aiResponse += chunk;
          // 更新 AI 消息
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, text: aiResponse }
                : msg
            )
          );
        },
        {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
        }
      );

      // 保存 AI 回复到对话
      await conversationAPI.addMessage(conversationId, 'assistant', aiResponse);

      // 保存到记忆系统
      if (aiResponse.length > 20) {
        await memoryAPI.create({
          userId,
          type: 'conversation',
          content: `用户：${text}\nAI：${aiResponse}`,
          metadata: {
            importance: 3,
          },
          timestamp: new Date(),
        });
      }

      // 使用 TTS 播放回复
      if (isSpeakingSupported() && aiResponse) {
        setSpeaking(true);
        speakText(aiResponse, () => setSpeaking(false));
      }

    } catch (error: any) {
      console.error('AI 回复失败:', error);
      
      // 添加错误消息
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        sender: 'ai',
        text: `抱歉，发生了错误：${error.message || '无法获取回复'}。请检查 API Key 设置。`,
      }]);
    } finally {
      setChatLoading(false);
    }
  }, [messages, chatLoading, currentConversationId, userId, speaking]);

  return (
    <GradientBackground>
      <ThreeColumnLayout
        leftSidebar={
          <AvatarList
            models={LOCAL_MODELS}
            selectedIndex={selectedModelIndex}
            onSelect={setSelectedModelIndex}
            loading={loadingModel}
          />
        }
        mainContent={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '100%',
          }}>
            {/* 3D 角色展示区域 */}
            <div className="card" style={{
              flex: 1,
              position: 'relative',
              minHeight: 0,
            }}>
              {loadingModel && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  zIndex: 10,
                  fontSize: '14px',
                }}>
                  加载模型中...
                </div>
              )}
              <Avatar3D
                speaking={speaking}
                listening={vadActive}
                customModel={customModel}
                enableControls={true}
              />
            </div>

            {/* 聊天对话框 */}
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              disabled={loadingModel}
            />
          </div>
        }
        rightSidebar={
          <ControlPanel
            ttsText={ttsText}
            onTtsTextChange={setTtsText}
            speaking={speaking}
            onSpeak={handleSpeak}
            onStopSpeak={handleStopSpeak}
            micActive={micActive}
            onToggleMic={handleToggleMic}
            vadActive={vadActive}
            onOpenSettings={() => setShowSettings(true)}
          />
        }
      />

      {/* 设置模态框 */}
      {showSettings && userId && (
        <Settings userId={userId} onClose={() => setShowSettings(false)} />
      )}
    </GradientBackground>
  );
}
