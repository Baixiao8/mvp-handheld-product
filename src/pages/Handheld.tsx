import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

/**
 * 屏 2 · 手持版主页
 *
 * T1 占位 — T2 实现完整流程:
 *   - ProductUpload(上传商品图,支持拖/点/粘贴)
 *   - ModelPicker(3 选 1 模特)
 *   - AdvancedOptions(尺寸 + HD 折叠)
 *   - GenerateButton · Hero CTA(Lime + ✨)
 *   - LoadingModal(轮询任务)
 *   - ResultPage(下载 / 再生成 / 反馈)
 *   - ErrorModal(算力不足 / 生成失败 / 上传失败)
 */
export default function Handheld() {
  const navigate = useNavigate();

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

      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--line-2)',
        borderRadius: 16,
        padding: 32,
        marginTop: 24,
        color: 'var(--fg-2)',
        textAlign: 'center',
      }}>
        <p style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: 'var(--fg-1)' }}>
          T1 脚手架完成 ✓
        </p>
        <p>T2 将在此处填充:</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12, fontSize: 13, lineHeight: 2 }}>
          <li>ProductUpload · 上传商品图</li>
          <li>ModelPicker · 3 选 1 模特</li>
          <li>AdvancedOptions · 尺寸 + HD 折叠</li>
          <li>GenerateButton · Hero CTA(Lime + ✨)</li>
          <li>LoadingModal · 轮询任务进度</li>
          <li>ResultPage · 下载 / 再生成 / 反馈</li>
          <li>ErrorModal · 算力 / 生成失败</li>
        </ul>
      </div>
    </div>
  );
}
