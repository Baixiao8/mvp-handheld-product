import { useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import { track } from '../tracking';

/**
 * 屏 1 · 商品图功能页(入口)
 * 显示 5 个 tab(白底图 / 场景图 / 海报图 / 详情图 / 手持版 NEW)
 * 点击"手持版"进入主流程
 */
export default function ProductImage() {
  const navigate = useNavigate();

  const handleHandheldClick = () => {
    track.tabClick({ previousTab: 'whitebackground' });
    navigate('/handheld');
  };

  return (
    <div className="page-product-image">
      <h1 className="page-title">商品图</h1>
      <p className="page-subtitle">一键生成专业商品图,5 个平台一键适配</p>

      <div className="tab-bar">
        <button className="tab-btn active">白底图</button>
        <button className="tab-btn">场景图</button>
        <button className="tab-btn">海报图</button>
        <button className="tab-btn">详情图</button>
        <button className="tab-btn tab-btn-handheld" onClick={handleHandheldClick}>
          手持版 <span className="badge-new">NEW</span>
        </button>
      </div>

      <div className="entry-content">
        <div className="entry-arrow-hint">
          <span className="arrow-up">↑</span>
          点击「手持版」体验新功能
        </div>
        <div className="placeholder-grid">
          <Card className="placeholder-card">白底图功能</Card>
          <Card className="placeholder-card">场景图功能</Card>
          <Card className="placeholder-card">海报图功能</Card>
          <Card className="placeholder-card">详情图功能</Card>
        </div>
        <div className="placeholder-hint">(其他 tab 内容由千图AI 现有功能填充,原型省略)</div>
      </div>
    </div>
  );
}
