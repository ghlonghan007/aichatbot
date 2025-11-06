import { useCallback, useState } from 'react';
import * as THREE from 'three';
import { loadModel } from '../lib/modelLoader';

type Props = {
  onModelLoaded: (model: THREE.Group) => void;
};

export default function ModelUploader({ onModelLoaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const model = await loadModel(file);
      onModelLoaded(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : '模型加载失败');
      console.error('模型加载错误:', err);
    } finally {
      setLoading(false);
    }
  }, [onModelLoaded]);

  const handleUrlLoad = useCallback(async () => {
    const url = prompt(
      '请输入模型 URL（支持 .glb, .gltf, .fbx, .obj）:\n\n' +
      '示例：\n' +
      'https://models.readyplayer.me/[你的ID].glb\n' +
      'https://avatars.readyplayer.me/[你的ID].glb?textureQuality=high'
    );
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const model = await loadModel(url);
      onModelLoaded(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : '模型加载失败');
      console.error('模型加载错误:', err);
    } finally {
      setLoading(false);
    }
  }, [onModelLoaded]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ 
          flex: 1, 
          padding: '8px 12px', 
          background: '#4a90e2', 
          color: '#fff', 
          borderRadius: 6, 
          textAlign: 'center', 
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? '加载中...' : '📁 上传模型文件'}
          <input
            type="file"
            accept=".glb,.gltf,.fbx,.obj"
            onChange={handleFileUpload}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={handleUrlLoad}
          disabled={loading}
          style={{
            padding: '8px 12px',
            background: '#5cb85c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          🌐 从 URL 加载
        </button>
      </div>
      {error && (
        <div style={{ padding: 8, background: '#fee', color: '#c33', borderRadius: 4, fontSize: 12 }}>
          ❌ {error}
        </div>
      )}
      <div style={{ fontSize: 11, color: '#666' }}>
        支持格式: GLB, GLTF, FBX, OBJ
      </div>
    </div>
  );
}

