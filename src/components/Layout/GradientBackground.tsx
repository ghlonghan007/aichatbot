import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function GradientBackground({ children }: Props) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0a4d4e 0%, #1a1f3a 50%, #0f1419 100%)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

