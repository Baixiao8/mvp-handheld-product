import { useNavigate } from 'react-router-dom';
import { Button, Modal, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import ProductUpload from '@/components/ProductUpload';
import ModelPicker from '@/components/ModelPicker';
import AdvancedOptions from '@/components/AdvancedOptions';
import HandheldResult from '@/components/HandheldResult';
import { useGenerate } from '@/hooks/useGenerate';
import { useHandheldStore } from '@/store';
import { getQuota } from '@/api/handheld';

/**
 * 屏 2 · 手持版主页
 *
 * 整合:Upload + ModelPicker + AdvancedOptions + Hero CTA + Loading + Result + Error
 * 完整跑通 prd.md §3 主流程 + 异常流程
 */
export default function Handheld() {
  const navigate = useNavigate();
  const { productImageUrl, hdEnhance } = useHandheldStore();
  const { isGenerating, progress, resultUrl, error, generate, cancel, reset } = useGenerate();

  // 算力余额(用于显示在 CTA 上)
  useQuery({
    queryKey: ['quota'],
    queryFn: getQuota,
  });

  const cost = hdEnhance ? 16 : 12;

  // 生成成功 → 展示结果页(回到主页 = onBack 调 reset)
  if (resultUrl) {
    return (
      <HandheldResult
        resultUrl={resultUrl}
        onRegenerate={() => {
          reset();
          setTimeout(generate, 100);
        }}
        onBack={reset}
      />
    );
  }

  return (
    <div className="page-handheld">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/product-image')}
        style={{ color: 'var(--fg-2)', padding: 0, marginBottom: 12 }}
      >
        返回商品图
      </Button>

      <h1 className="page-title">手持版商品图</h1>
      <p className="page-subtitle">上传商品图,3 步生成模特手持商品的专业图</p>

      <div className="section-card">
        <ProductUpload />
        <ModelPicker />
        <AdvancedOptions />
      </div>

      {/* Hero CTA · §1.5 Lime + pill + ✨ */}
      <div className="fixed-bottom">
        <button
          className="btn-hero"
          disabled={!productImageUrl || isGenerating}
          onClick={generate}
        >
          <span className="sparkles">✨</span>
          <span>{!productImageUrl ? '请先上传商品图' : `生成 (${cost} 算力)`}</span>
        </button>
      </div>

      {/* Loading Modal · 轮询任务进度 */}
      <Modal
        open={isGenerating}
        footer={null}
        closable={false}
        maskClosable={false}
        width={420}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 20 }}>
            生成中{' '}
            <span style={{ color: 'var(--accent-lime)' }}>{progress}</span>%
          </div>
          <div style={{ color: 'var(--fg-2)', fontSize: 13, marginTop: 4 }}>
            预计还需 {Math.max(1, 8 - Math.round(progress / 12))} 秒
          </div>
          <Button
            type="text"
            onClick={cancel}
            style={{ marginTop: 20, color: 'var(--fg-2)' }}
          >
            取消生成
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        open={!!error}
        title="生成失败"
        onCancel={reset}
        footer={[
          <Button key="ok" type="primary" onClick={reset}>
            确定
          </Button>,
        ]}
        centered
      >
        <p style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>{error}</p>
      </Modal>
    </div>
  );
}
