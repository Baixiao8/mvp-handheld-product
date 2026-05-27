import type { ReactNode } from 'react';
import { Button } from 'antd';

/**
 * App Layout · 顶部导航(对齐 ai.58pic.com)+ 主内容区
 *
 * 顶部:Logo + 主导航(主站/AI 工具/AI 模板库/AI 模型/工作流)+ 算力 + VIP CTA
 * 主内容:Outlet by Router
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">●</span>
            <span>千图AI</span>
          </div>
          <nav className="main-nav">
            <a className="nav-link" href="#">主站</a>
            <a className="nav-link active" href="#">AI 工具</a>
            <a className="nav-link" href="#">AI 模板库</a>
            <a className="nav-link" href="#">AI 模型</a>
            <a className="nav-link" href="#">工作流</a>
          </nav>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="quota">
            <span className="quota-icon">◆</span>
            <span>86</span>
            <span className="quota-unit">算力</span>
          </div>
          <Button className="btn-vip">立即开通 →</Button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
