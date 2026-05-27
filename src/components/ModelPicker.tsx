import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { getModels } from '@/api/handheld';
import { useHandheldStore } from '@/store';
import { track } from '@/tracking';

/**
 * 模特选择组件
 * MVP: 3 张卡片 grid · 激活态 Lime + 对勾(§3B 选中态铁律)
 */
export default function ModelPicker() {
  const { models, selectedModelId, setSelectedModelId, setModels } = useHandheldStore();

  const { data, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: getModels,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.models) {
      setModels(data.models);
    }
  }, [data, setModels]);

  const handleSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    track.modelSelect({ modelId });
  };

  return (
    <div className="form-section">
      <label className="section-label">选择模特</label>
      {isLoading ? (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <div className="model-list">
          {models.map((model) => (
            <div
              key={model.id}
              className={`model-card ${selectedModelId === model.id ? 'active' : ''}`}
              onClick={() => handleSelect(model.id)}
            >
              <div className="model-thumb">
                <img src={model.thumbnailUrl} alt={model.name} />
              </div>
              <div className="model-name">{model.name}</div>
              {selectedModelId === model.id && (
                <div className="model-check">
                  <CheckOutlined />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
