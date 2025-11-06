import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import GradientBackground from './components/Layout/GradientBackground';
import ThreeColumnLayout from './components/Layout/ThreeColumnLayout';
import AvatarList from './components/AvatarList/AvatarList';
import Avatar3D from './components/Avatar3D';
import ChatBox, { ChatMessage } from './components/Chat/ChatBox';
import ControlPanel from './components/ControlPanel/ControlPanel';
import { speakText, stopSpeaking, isSpeakingSupported } from './lib/tts';
import { useMicrophoneVAD } from './lib/audio';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 3D AI 助手，有什么可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);

  // 设置状态
  const [showSettings, setShowSettings] = useState(false);

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

  const handleSendMessage = useCallback((content: string) => {
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // 模拟 AI 回复（稍后会接入真实 API）
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '我收到了你的消息！后续我们会集成真实的 AI 对话功能。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }, []);

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

      {/* 设置模态框（稍后实现） */}
      {showSettings && (
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
          onClick={() => setShowSettings(false)}
        >
          <div
            className="card"
            style={{
              width: '600px',
              maxHeight: '80vh',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '16px' }}>设置</h2>
            <p style={{ color: '#64748b' }}>
              设置页面开发中...后续会添加用户信息、API Key 和记忆管理功能。
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowSettings(false)}
              style={{ marginTop: '16px' }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </GradientBackground>
  );
}
