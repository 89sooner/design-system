// Refs: WP-028 NFR-001 FR-DOC-001 FR-DX-004
// 랜딩 경로를 정적 HTML로 프리렌더한다. 첫 페인트가 애플리케이션 JS 다운로드를
// 기다리지 않아야 Fast 3G LCP p75 2.5초 예산이 성립한다. 공개 컴포넌트의 SSR
// 안전성은 FR-DX-004의 renderToString 전수 검사가 보증한다.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

// react-router-dom 7은 StaticRouter를 별도 패키지로 옮겼다. 일회성 renderToString에는
// 동형인 MemoryRouter가 동등하며 새 의존성이 필요 없다.
export function render(url: string): string {
  return renderToString(<StrictMode><MemoryRouter initialEntries={[url]} basename={import.meta.env.BASE_URL}><App /></MemoryRouter></StrictMode>);
}
