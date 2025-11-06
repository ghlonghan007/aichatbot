type Props = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function Message({ role, content, timestamp }: Props) {
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {/* 消息气泡 */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '12px',
          background: isUser 
            ? 'linear-gradient(135deg, #0a9396 0%, #005f73 100%)'
            : 'rgba(255, 255, 255, 0.08)',
          color: '#e8e9ed',
          fontSize: '14px',
          lineHeight: '1.5',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>

        {/* 时间戳 */}
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          paddingLeft: isUser ? '0' : '8px',
          paddingRight: isUser ? '8px' : '0',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timestamp.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}

