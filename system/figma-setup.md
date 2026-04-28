# Figma Setup — 두 경로 중 선택

비어있는 Figma 파일(`AJA-Mentoring`)에 디자인 시스템과 목업을 넣는 방법.

## 경로 A. html.to.design + Tokens Studio (추천, 30분 내)

### 1. 플러그인 2개 설치
Figma Desktop → 우상단 `Resources` → `Plugins`
- **html.to.design** — HTML 파일을 Figma 프레임으로 변환
- **Tokens Studio for Figma** — JSON을 Variables로 import

### 2. 디자인 토큰 import (Tokens Studio)
1. 플러그인 실행 → 우측 패널 열림
2. 우상단 톱니(Settings) → `Tools` 탭 → `Import` → `Single File`
3. `mockups/figma-tokens.json` 업로드
4. 좌측 token set에 `global`이 뜸. 상단 `Apply to document` 클릭
5. `Create Variables` 선택 → "Create new collection: AjaMentor DS"
6. 완료되면 Figma 좌측 **Local variables**에 `AjaMentor DS` 컬렉션 생성됨

### 3. HTML → Figma import (html.to.design)
1. 플러그인 실행 → `Import from HTML` 탭 선택 → `Upload file`
2. `mockups/home.html` 업로드
3. 약 10초 뒤 390×[스크롤 길이] 프레임이 캔버스에 생성됨
4. 이후 생성할 다른 HTML (검색, 멘토 상세 등)도 같은 방식으로 import

### 4. Variables 바인딩 (선택)
Import된 프레임의 색상·폰트·radius는 고정값으로 들어옴. 이를 Variables로 바꾸려면:
- 요소 선택 → 우측 속성 클릭 → `Apply variable` 선택 → `AjaMentor DS / color / primary / base` 같은 식으로 연결
- 처음에는 건너뛰고, 디자인 확정되면 한 번에 바꿔도 됨

---

## 경로 B. 수동 설정 (세밀 제어 원할 때)

### Variables 수동 생성
1. Figma 좌측 `Local variables` → 컬렉션 `AjaMentor DS` 만들기
2. **Color 그룹**: `figma-tokens.json`의 색상들을 복붙. 폴더 구조 예:
   - `color/primary/base` = `#1B61C9`
   - `color/primary/hover` = `#1854AE`
   - `color/text/default` = `#181D26`
   - ... (전체 ~30개)
3. **Number 그룹** (radius, spacing, font size)
   - `radius/md` = `12`
   - `radius/lg` = `16`
   - `spacing/4` = `16`
   - `font/size/body` = `16`

### Text Styles
`mockups/tokens.css`의 `--font-*` 섹션을 보고 Styles로 만들기:
- `Display Hero` · Inter 700 · 48/55.2 · tracking 0
- `Card Title` · Inter 500 · 24/30 · tracking 0.12
- `Body` · Inter 500 · 16/20.8 · tracking 0.08
- `Caption` · Inter 400 · 14/18.2 · tracking 0.08

### 컴포넌트
기본 필요 컴포넌트 (variants 포함):
- **Button** — primary / secondary / ghost × default / hover / pressed / disabled
- **Chip** — default / selected / subtle
- **Badge** — verified (green) / hot (amber) / status
- **MentorCard** — popular (vertical) / list (horizontal)
- **Input** — default / focus / filled / error
- **TopAppBar / TabBar**

각 컴포넌트 specs는 `mockups/home.html`의 CSS 클래스에 정의되어 있음.

---

## 경로 비교

|   | 경로 A (플러그인) | 경로 B (수동) |
|---|---|---|
| 속도 | 빠름 (30분) | 느림 (2-3시간) |
| Variables 정확성 | 높음 (JSON 직접 import) | 높음 (수동 입력) |
| 디자인 자유도 | 제한적 (HTML 구조 따라옴) | 높음 |
| 유지보수 | 쉬움 (HTML 수정 → 재import) | 어려움 (수동 동기화) |
| 추천 대상 | MVP 단계, 빠른 iteration | 장기 프로덕트 디자인 |

**MVP라면 경로 A 강력 추천.** 나중에 필요 시 경로 B로 재작업 가능.

---

## 내 역할 (Claude + Figma MCP)

Figma MCP는 **읽기 전용**이라 내가 Figma 안에서 직접 디자인을 생성/수정할 수 없다. 대신:

1. **검증**: 사용자가 Variables 설정한 뒤 `get_variable_defs` 호출해서 토큰과 1:1 일치하는지 체크
2. **차이점 리포트**: 불일치하는 값 지적
3. **코드 역동기화**: 사용자가 Figma에서 디자인 변경 → 내가 `get_design_context`로 읽어와서 `tokens.css` / HTML 업데이트
4. **새 화면 HTML 작성**: 나머지 16개 화면을 같은 방식으로 작성 → 사용자가 html.to.design으로 import

---

## 다음 단계 제안

1. 위 경로 A 2개 플러그인 설치
2. `figma-tokens.json` import → Variables 확인
3. `home.html` import → 첫 프레임 확인
4. 결과물 보고 피드백 → 내가 16개 화면 HTML 추가 작성 → 일괄 import
