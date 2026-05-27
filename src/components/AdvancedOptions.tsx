import { Radio, Switch } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useHandheldStore } from '@/store';
import { track } from '@/tracking';
import type { AspectRatio } from '@/types';

/**
 * 高级选项 · 折叠
 * - 输出尺寸:1:1 / 3:4 / 2:3(默认 1:1)
 * - 高清放大:开关(+4 算力)
 */
export default function AdvancedOptions() {
  const {
    aspectRatio,
    setAspectRatio,
    hdEnhance,
    setHdEnhance,
    advancedExpanded,
    setAdvancedExpanded,
  } = useHandheldStore();

  const handleToggle = () => {
    const next = !advancedExpanded;
    if (next) track.advancedExpand();
    setAdvancedExpanded(next);
  };

  return (
    <div className="form-section">
      <button
        type="button"
        className={`advanced-toggle ${advancedExpanded ? 'expanded' : ''}`}
        onClick={handleToggle}
      >
        <span>高级选项</span>
        <DownOutlined className="advanced-arrow" />
      </button>
      {advancedExpanded && (
        <div className="advanced-content">
          <div className="form-row">
            <label className="form-label">输出尺寸</label>
            <Radio.Group
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              optionType="button"
              size="small"
              options={[
                { label: '1:1', value: '1:1' },
                { label: '3:4', value: '3:4' },
                { label: '2:3', value: '2:3' },
              ]}
            />
          </div>
          <div className="form-row">
            <label className="form-label">高清放大</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch checked={hdEnhance} onChange={setHdEnhance} size="small" />
              <span className="switch-hint">{hdEnhance ? '开启 (+4 算力)' : '关闭'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
