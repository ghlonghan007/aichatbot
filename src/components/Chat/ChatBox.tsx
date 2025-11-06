import { useState, useRef, useEffect } from 'react';
import Message from './Message';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Props = {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  disabled?: boolean;
};

export default function ChatBox({ messages, onSendMessage, disabled }: Props) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '400px',
    }}>
      {/* 头部 */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <span>聊天对话</span>
          <span className="text-xs text-muted">{messages.length} 条消息</span>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {messages.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '14px',
          }}>
            开始对话吧...
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 输入框 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行)"
            disabled={disabled}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none',
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            style={{
              padding: '0 20px',
              flexShrink: 0,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

