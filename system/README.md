# AjaMentor Mockups

MD 기반 디자인 시스템을 **코드로 strict 매핑**한 목업입니다. 이 폴더가 디자인의 single source of truth.

## 파일
- `tokens.css` — Airtable DS + AjaMentor 오버레이 (CSS variables)
- `components.css` — 공통 컴포넌트 클래스
- `theme-switcher.js` — `?theme=` 파라미터·localStorage 기반 5테마 적용
- `nav.js` — 헤더 뒤로가기(`history.back()` 또는 `data-back`) + `[data-next]` 단계 라우팅. theme 쿼리 자동 보존
- `home.html` — 메인 홈 화면 (모바일 390px)

## 로컬 확인
```bash
open mockups/home.html   # macOS
```
Chrome DevTools → Device Toolbar → iPhone 14 (390×844) 로 보면 실제 크기로 렌더링됩니다.

## Figma로 옮기기

### 방법 1. html.to.design 플러그인 (추천)
1. Figma Desktop → Community → "html.to.design" 플러그인 설치
2. 플러그인 실행 → URL 또는 HTML 파일 업로드
3. `home.html` 드래그 → Figma 프레임으로 import
4. Variables는 CSS custom properties에서 자동 추출됨

### 방법 2. HTML → React/Code Connect
이 목업을 베이스로 React 컴포넌트로 변환 후 Code Connect로 Figma와 연결.

## 디자인 시스템 원본
- 출처: https://getdesign.md/airtable/design-md
- AjaMentor 오버레이: Amber(#F59E0B) 인기/HOT 뱃지용, Error(#DC2626) 취소/환불

## 다음 화면 추가 시 규칙
- `tokens.css`는 절대 오버라이드 금지, 컴포넌트는 이 토큰만 사용
- 새 페이지는 `<screen-name>.html`로 추가하고 `<link>` 구문으로 tokens.css 참조
- 한글 본문 기본 letter-spacing 0 유지 (영문 Inter positive tracking과 구분)

## Figma MCP 사용 흐름
1. 사용자가 Figma에서 작업
2. Claude는 `get_design_context` / `get_variable_defs` 로 **읽기만** 가능
3. 불일치 발견 시 코드(이 폴더)를 업데이트 → 사용자가 Figma에 반영
