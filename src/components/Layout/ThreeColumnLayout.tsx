import { ReactNode } from 'react';

type Props = {
  leftSidebar: ReactNode;
  mainContent: ReactNode;
  rightSidebar: ReactNode;
};

export default function ThreeColumnLayout({ leftSidebar, mainContent, rightSidebar }: Props) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      gap: '16px',
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      {/* 左侧栏 - 角色列表 */}
      <aside style={{
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {leftSidebar}
      </aside>

      {/* 中间区域 - 3D 展示 + 聊天 */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {mainContent}
      </main>

      {/* 右侧栏 - 控制面板 */}
      <aside style={{
        width: '320px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {rightSidebar}
      </aside>
    </div>
  );
}

