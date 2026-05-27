/**
 * Antd ConfigProvider Theme
 * 对齐 designknowledge.md token 体系 · Dark Mode 默认
 *
 * §1.4 Primary CTA = fg/1 实底 → Antd colorPrimary 用 #F5F5F5
 * §1.3 全 pill → Button borderRadius = 9999
 * §1.5 Hero CTA(我们自己 .btn-hero 实现,不走 Antd Primary)
 */
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#F5F5F5',       // Primary CTA = fg/1
    colorError: '#EF4444',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorInfo: '#3B82F6',

    borderRadius: 8,
    borderRadiusLG: 16,             // §1.3 Card 12-16
    borderRadiusSM: 4,

    fontFamily: '-apple-system, system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: 14,

    // Dark Mode 配色 · 对齐 tokens.css
    colorBgBase: '#0A0A0A',
    colorBgContainer: '#171717',
    colorBgElevated: '#1F1F1F',
    colorBgLayout: '#0A0A0A',

    colorText: '#F5F5F5',
    colorTextSecondary: '#A3A3A3',
    colorTextTertiary: '#737373',
    colorTextQuaternary: '#525252',

    colorBorder: '#262626',
    colorBorderSecondary: '#1F1F1F',
  },
  components: {
    Button: {
      // §1.3 全 pill 铁律
      borderRadius: 9999,
      borderRadiusSM: 9999,
      borderRadiusLG: 9999,
      paddingInline: 22,
      paddingInlineLG: 28,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      fontWeight: 600,
      primaryShadow: 'none',
    },
    Card: {
      borderRadiusLG: 16,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 8,
    },
    Switch: {
      colorPrimary: '#D8F51E',       // §3B.4 选中态 Lime
    },
    Radio: {
      colorPrimary: '#D8F51E',       // §3B.3 选中态 Lime
    },
    Checkbox: {
      colorPrimary: '#D8F51E',       // §3B.2 选中态 Lime
    },
    Tabs: {
      itemSelectedColor: '#F5F5F5',
      inkBarColor: '#D8F51E',
    },
    Spin: {
      colorPrimary: '#D8F51E',       // AI 时刻 = Lime
    },
  },
};
