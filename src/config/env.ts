/**
 * 环境变量统一入口
 *
 * 所有 import.meta.env.* 都在这里读一次,业务代码只用 ENV.xxx
 * 切真实 backend = 改 .env.local 文件,代码 0 改动
 */
import type { UserType } from '@/types';

export const ENV = {
  /** 是否启用 MSW Mock */
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  /** API base URL */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1/handheld',
  /** 用户标签(埋点 + 使用率口径) */
  userType: ((import.meta.env.VITE_USER_TYPE as UserType) || 'ecommerce') as UserType,
  /** 是否生产环境 */
  isProd: import.meta.env.PROD,
  /** Router basename(GitHub Pages 子路径适配) */
  basename: (import.meta.env.PROD ? '/mvp-handheld-product' : '/') as string,
};
