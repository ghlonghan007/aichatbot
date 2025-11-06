import AvatarCard from './AvatarCard';

type AvatarModel = {
  name: string;
  path: string;
};

type Props = {
  models: AvatarModel[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  loading?: boolean;
};

export default function AvatarList({ models, selectedIndex, onSelect, loading }: Props) {
  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* 头部 */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <span>角色选择</span>
          <span className="text-xs text-muted">{models.length} 个角色</span>
        </div>
      </div>

      {/* 角色列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
        }}>
          {models.map((model, index) => (
            <AvatarCard
              key={index}
              name={model.name}
              isSelected={selectedIndex === index}
              onClick={() => !loading && onSelect(index)}
            />
          ))}
        </div>
      </div>

      {loading && (
        <div style={{
          padding: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          加载中...
        </div>
      )}
    </div>
  );
}

