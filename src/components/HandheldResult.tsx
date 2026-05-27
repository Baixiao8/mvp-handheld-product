import { useState } from 'react';
import { Button, message } from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  StarOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useHandheldStore } from '@/store';
import { track } from '@/tracking';
import type { FeedbackRating } from '@/types';

interface Props {
  resultUrl: string;
  onRegenerate: () => void;
  onBack: () => void;
}

/**
 * 结果展示 · 下载 / 再生成 / 保存 / 反馈打分
 */
export default function HandheldResult({ resultUrl, onRegenerate, onBack }: Props) {
  const { currentTaskId } = useHandheldStore();
  const [feedback, setFeedback] = useState<FeedbackRating | null>(null);

  const handleDownload = (format: 'png' | 'jpg') => {
    if (currentTaskId) track.download({ taskId: currentTaskId, format });
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `handheld_${Date.now()}.${format}`;
    a.click();
    message.success(`已下载 ${format.toUpperCase()}`);
  };

  const handleFeedback = (rating: FeedbackRating) => {
    setFeedback(rating);
    if (currentTaskId) track.feedback({ taskId: currentTaskId, rating });
    const label = rating === 'satisfied' ? '满意' : rating === 'neutral' ? '一般' : '不满意';
    message.success(`已反馈:${label}`);
  };

  return (
    <div className="page-handheld-result">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ color: 'var(--fg-2)', padding: 0, marginBottom: 12 }}
      >
        返回
      </Button>
      <h1 className="page-title">生成结果</h1>

      <div className="result-content">
        <div className="result-image-wrap">
          <img id="result-image" src={resultUrl} alt="生成结果" />
        </div>
        <div className="result-actions">
          <Button icon={<DownloadOutlined />} onClick={() => handleDownload('png')}>
            下载 PNG
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => handleDownload('jpg')}>
            下载 JPG
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRegenerate}>
            再生成 (12 算力)
          </Button>
          <Button icon={<StarOutlined />}>保存到素材库</Button>
        </div>
        <div className="feedback-section">
          <span className="feedback-label">这次效果:</span>
          <button
            className={`feedback-btn ${feedback === 'satisfied' ? 'selected' : ''}`}
            onClick={() => handleFeedback('satisfied')}
          >
            满意
          </button>
          <button
            className={`feedback-btn ${feedback === 'neutral' ? 'selected' : ''}`}
            onClick={() => handleFeedback('neutral')}
          >
            一般
          </button>
          <button
            className={`feedback-btn ${feedback === 'unsatisfied' ? 'selected' : ''}`}
            onClick={() => handleFeedback('unsatisfied')}
          >
            不满意
          </button>
        </div>
      </div>
    </div>
  );
}
