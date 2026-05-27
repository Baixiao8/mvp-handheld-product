import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { antdTheme } from './styles/antd-theme';
import { ENV } from './config/env';
import './styles/tokens.css';
import './styles/global.css';

/**
 * MSW 启动 · 仅 VITE_USE_MOCK=true 时
 * 真实 backend 联调时改 .env.local 把 VITE_USE_MOCK=false
 */
async function enableMocking() {
  if (!ENV.useMock) return;
  const { worker } = await import('./api/mock-handlers');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${ENV.basename === '/' ? '' : ENV.basename}/mockServiceWorker.js`,
    },
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename={ENV.basename}>
        <ConfigProvider theme={antdTheme}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ConfigProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
});
