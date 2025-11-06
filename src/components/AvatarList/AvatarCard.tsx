type Props = {
  name: string;
  thumbnailUrl?: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function AvatarCard({ name, thumbnailUrl, isSelected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`card card-hover ${isSelected ? 'selected' : ''}`}
      style={{
        padding: '12px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* 缩略图 */}
      <div style={{
        width: '100%',
        height: '120px',
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span style={{ fontSize: '32px', opacity: 0.3 }}>👤</span>
        )}
      </div>

      {/* 角色名称 */}
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        textAlign: 'center',
        color: isSelected ? '#0bb5b9' : '#e8e9ed',
        transition: 'color 0.2s ease',
      }}>
        {name}
      </div>
    </div>
  );
}

