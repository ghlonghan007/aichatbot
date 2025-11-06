import { useState } from 'react';
import ScreenCapture from '../ScreenCapture';

type Props = {
  // TTS 相关
  ttsText: string;
  onTtsTextChange: (text: string) => void;
  speaking: boolean;
  onSpeak: () => void;
  onStopSpeak: () => void;
  
  // 麦克风相关
  micActive: boolean;
  onToggleMic: () => void;
  vadActive: boolean;
  
  // 设置
  onOpenSettings: () => void;
};

export default function ControlPanel({
  ttsText,
  onTtsTextChange,
  speaking,
  onSpeak,
  onStopSpeak,
  micActive,
  onToggleMic,
  vadActive,
  onOpenSettings,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      overflowY: 'auto',
    }}>
      {/* TTS 控制 */}
      <div className="card">
        <div className="card-header">语音合成 (TTS)</div>
        <div className="card-body flex-col gap-3">
          <textarea
            className="input"
            value={ttsText}
            onChange={(e) => onTtsTextChange(e.target.value)}
            placeholder="输入要朗读的文本..."
            rows={4}
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={onSpeak}
              disabled={speaking}
              style={{ flex: 1 }}
            >
              {speaking ? '播放中...' : '播放'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onStopSpeak}
              disabled={!speaking}
            >
              停止
            </button>
          </div>
        </div>
      </div>

      {/* 麦克风控制 */}
      <div className="card">
        <div className="card-header">麦克风控制</div>
        <div className="card-body flex-col gap-3">
          <button
            className={`btn ${micActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={onToggleMic}
            style={{ width: '100%' }}
          >
            {micActive ? '🎤 关闭麦克风' : '🎤 开启麦克风'}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ opacity: 0.7 }}>状态:</span>
            <span style={{
              color: micActive ? (vadActive ? '#0bb5b9' : '#10b981') : '#64748b'
            }}>
              {micActive ? (vadActive ? '检测到说话' : '监听中') : '未开启'}
            </span>
          </div>
        </div>
      </div>

      {/* 屏幕捕获 */}
      <div className="card">
        <div className="card-header">屏幕捕获</div>
        <div className="card-body">
          <ScreenCapture />
        </div>
      </div>

      {/* 高级选项 */}
      <div className="card">
        <div 
          className="card-header"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <div className="flex items-center justify-between">
            <span>高级选项</span>
            <span style={{ fontSize: '12px' }}>
              {showAdvanced ? '▼' : '▶'}
            </span>
          </div>
        </div>
        {showAdvanced && (
          <div className="card-body flex-col gap-2">
            <button
              className="btn btn-secondary"
              onClick={onOpenSettings}
              style={{ width: '100%' }}
            >
              ⚙️ 打开设置
            </button>
            <div className="text-xs text-muted" style={{ marginTop: '8px' }}>
              💡 提示：
              <br />• 鼠标拖拽旋转，滚轮缩放
              <br />• 方向键 ←→↑↓ 平移人物
              <br />• Q/PageUp 升高，E/PageDown 降低
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

