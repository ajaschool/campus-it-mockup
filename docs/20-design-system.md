# 20. 디자인 시스템 — Campus It

> **확정 테마:** Campus Editorial (인디고)  
> **SoT 코드:** `frontend/src/styles/abstracts/_variables.scss`  
> **SoT 목업:** `mockups/system/tokens.css`  
> **최종 갱신:** 2026-05-06

---

## 1. 설계 원칙

| 원칙 | 내용 |
|---|---|
| **신뢰** | 인디고(`#4a3d99`)를 중심으로 검증·전문성의 인상 |
| **전환** | Accent 오렌지(`#ff8a3d`)로 CTA를 명확히 분리 |
| **부담 없음** | 연한 퍼플 서피스(`#faf9fc`)로 학생·학부모 친화적 톤 |
| **일관성** | 이 파일에 없는 색상 하드코딩 금지 |
| **플랫** | 그림자 없음. 깊이는 색상·border로 표현 |

---

## 2. 컬러 팔레트

### 2-1. Primary — 인디고

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-primary` | `#4A3D99` | 메인 버튼, 선택 탭, 핵심 CTA, 활성 상태 |
| `$color-primary-hover` | `#3F3485` | 버튼 hover |
| `$color-primary-pressed` | `#352B70` | 버튼 pressed / active |
| `$color-primary-dark` | `#282055` | 헤더 텍스트 강조, 진한 배지 |
| `$color-primary-light` | `#EDEBFF` | 선택된 카드 배경, 연한 강조 영역 |
| `$color-primary-subtle` | `#F6F4FF` | 섹션 배경, 페이지 배경 포인트 |
| `$color-primary-border` | `#D8D2FF` | 선택 카드 border, input focus border |
| `$color-primary-text` | `#342A73` | 연한 배경 위 인디고 텍스트 |

> `$color-primary-bg`는 `$color-primary-light`의 alias (backward compat).

---

### 2-2. Editorial 보조 팔레트

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-editorial-studio` | `#6B42B0` | 활기찬 바이올렛 — 배지, 포인트 텍스트 |
| `$color-editorial-plum` | `#6B5585` | 낮은 채도 플럼 — 차분한 보조 강조 |

---

### 2-3. Accent — 오렌지 CTA

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-accent` | `#FF8A3D` | 빠른 신청, 가격 강조, 이벤트 CTA |
| `$color-accent-hover` | `#F06F1F` | Accent 버튼 hover |
| `$color-accent-subtle` | `#FFF1E8` | 할인 쿠폰, 프로모션 배경 |

> `$color-amber` / `$color-amber-bg`는 각각 `$color-accent` / `$color-accent-subtle`의 alias.

---

### 2-4. Semantic — 상태 색상

#### Success

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-success` | `#16A36B` | 예약 확정, 결제 완료, 승인 |
| `$color-success-subtle` | `#E8F8F1` | 성공 안내 배경 |

#### Warning

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-warning` | `#F5A524` | 일정 변경 제안, 주의 안내 |
| `$color-warning-subtle` | `#FFF7E6` | 경고 박스 배경 |

#### Danger / Error

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-danger` | `#E5484D` | 취소, 환불, 오류, 반려 |
| `$color-danger-subtle` | `#FFF0F0` | 오류 안내 배경 |

> `$color-error` / `$color-error-bg`는 각각 `$color-danger` / `$color-danger-subtle`의 alias.

#### Info

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-info` | `#3478F6` | 상담 링크, 공지, 도움말 |
| `$color-info-subtle` | `#EEF5FF` | 정보 안내 배경 |

---

### 2-5. Text

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-text-strong` | `#17151F` | 제목, 핵심 문장 |
| `$color-text` | `#2B2933` | 본문 기본 |
| `$color-text-secondary` | `#313130` | 보조 본문 (backward compat) |
| `$color-text-muted` | `#6F6A7A` | 보조 설명, 메타 정보 |
| `$color-text-disabled` | `#A9A3B7` | 비활성 텍스트 |
| `$color-text-on-primary` | `#FFFFFF` | 프라이머리 배경 위 텍스트 |

> `$color-text-weak`는 `$color-text-muted`의 alias.

---

### 2-6. Surface / Background

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-bg` | `#FFFFFF` | 기본 배경 (= `$color-surface`) |
| `$color-bg-soft` | `#FAF9FC` | 페이지 배경 (= `$color-surface-subtle`) |
| `$color-surface` | `#FFFFFF` | 카드 기본 배경 |
| `$color-surface-raised` | `#FDFBFF` | 떠 있는 카드, 모달 |
| `$color-surface-subtle` | `#FAF9FC` | 섹션 배경 |
| `$color-surface-sunk` | `#EDE9E1` | 인풋 비활성, 내려간 배경 |

---

### 2-7. Border

| 토큰 | HEX | 사용처 |
|---|---|---|
| `$color-border` | `#E3DFEA` | 카드, input, divider |
| `$color-border-strong` | `#C8C1D8` | 강조 border |

---

### 2-8. 추천 UI 조합

| UI 영역 | 배경 | 텍스트/아이콘 |
|---|---|---|
| 메인 CTA "멘토링 신청하기" | `$color-primary` | `$color-text-on-primary` |
| CTA hover | `$color-primary-hover` | — |
| 빠른 신청 / 가격 강조 버튼 | `$color-accent` | `$color-text-on-primary` |
| 선택된 필터 / 선택된 대학 칩 | `$color-primary-light` | `$color-primary` |
| 멘토 인증 배지 | `$color-success-subtle` | `$color-success` |
| 예약 가능 상태 배지 | `$color-primary-subtle` | `$color-primary` |
| 일정 변경 제안 | `$color-warning-subtle` | `$color-warning` |
| 결제 실패 / 예약 취소 | `$color-danger-subtle` | `$color-danger` |
| 페이지 배경 | `$color-bg-soft` | — |
| 카드 배경 | `$color-surface` | — |

---

## 3. 타이포그래피

### 3-1. 폰트 패밀리

| 토큰 | 값 |
|---|---|
| `$font-family` | `"Pretendard", "Inter", -apple-system, system-ui, sans-serif` |

### 3-2. 타입 스케일

| 토큰 | 크기 | 용도 |
|---|---|---|
| `$font-size-hero` | `48px` | 랜딩 히어로 |
| `$font-size-section` | `40px` | 섹션 제목 |
| `$font-size-subhead` | `32px` | 서브헤딩 |
| `$font-size-card` | `24px` | 카드 제목 |
| `$font-size-feature` | `20px` | 피처 설명 |
| `$font-size-body-lg` | `18px` | 큰 본문 |
| `$font-size-body` | `16px` | 기본 본문 |
| `$font-size-button` | `16px` | 버튼 레이블 |
| `$font-size-caption` | `14px` | 캡션, 메타 |

### 3-3. 폰트 굵기

| 토큰 | 값 | 용도 |
|---|---|---|
| `$font-weight-regular` | `400` | 본문 |
| `$font-weight-medium` | `500` | 버튼, 활성 탭 |
| `$font-weight-bold` | `700` | 제목 |
| `$font-weight-black` | `900` | 히어로 |

### 3-4. 줄 간격

| 토큰 | 값 |
|---|---|
| `$line-height-tight` | `1.15` |
| `$line-height-snug` | `1.2` |
| `$line-height-normal` | `1.25` |
| `$line-height-relaxed` | `1.3` |
| `$line-height-loose` | `1.35` |

### 3-5. 자간 (Letter Spacing)

| 토큰 | 값 | 적용 |
|---|---|---|
| `$tracking-tight` | `-0.1px` | 버튼, 강조 텍스트 |
| `$tracking-normal` | `-0.2px` | 카드 제목 |
| `$tracking-loose` | `0px` | 기본 본문 |

---

## 4. 간격 (Spacing)

4px 그리드 기반.

| 토큰 | 값 |
|---|---|
| `$space-1` | `4px` |
| `$space-2` | `8px` |
| `$space-3` | `12px` |
| `$space-4` | `16px` |
| `$space-5` | `20px` |
| `$space-6` | `24px` |
| `$space-7` | `32px` |
| `$space-8` | `40px` |
| `$space-9` | `48px` |

---

## 5. Border Radius

| 토큰 | 값 | 적용 |
|---|---|---|
| `$radius-sm` | `2px` | 배지, 태그 |
| `$radius-md` | `4px` | 버튼, 인풋 (인더스트리얼) |
| `$radius-lg` | `8px` | 카드, 컨테이너 |
| `$radius-xl` | `12px` | 바텀시트, 큰 카드 |
| `$radius-2xl` | `16px` | 모달 |
| `$radius-full` | `9999px` | 아바타, pill 칩 |

---

## 6. 그림자 (Shadow)

멘토링 테마는 **flat** — 그림자 없음. 깊이는 border와 색상으로만 표현.

| 토큰 | 값 |
|---|---|
| `$shadow-button` | `none` |
| `$shadow-soft` | `none` |
| `$shadow-card` | `none` |

---

## 7. 레이아웃

| 토큰 | 값 |
|---|---|
| `$max-width-content` | `1200px` |
| `$header-height` | `64px` |

---

## 8. 컴포넌트별 사용 가이드

```scss
// ─── 핵심 전환 버튼
.primaryButton {
  background: $color-primary;
  color: $color-text-on-primary;
  border-radius: $radius-md;

  &:hover   { background: $color-primary-hover; }
  &:active  { background: $color-primary-pressed; }
}

// ─── 빠른 신청 / 가격 강조 버튼 (Accent)
.accentButton {
  background: $color-accent;
  color: $color-text-on-primary;
  border-radius: $radius-md;

  &:hover { background: $color-accent-hover; }
}

// ─── 선택된 필터 칩 / 대학 칩
.chipSelected {
  background: $color-primary-light;
  border: 1px solid $color-primary-border;
  color: $color-primary;
}

// ─── 인기 멘토 카드 강조
.mentorCardFeatured {
  background: $color-primary-subtle;
  border: 1px solid $color-primary-border;
}

// ─── 인증 멘토 배지
.verifiedBadge {
  background: $color-success-subtle;
  color: $color-success;
}

// ─── 가격 텍스트 강조
.priceText {
  color: $color-accent;
  font-weight: $font-weight-bold;
}

// ─── 오류 메시지
.errorMessage {
  background: $color-danger-subtle;
  color: $color-danger;
}
```

---

## 9. Alias 정리 (backward compat)

기존 코드를 즉시 깨지 않기 위해 아래 alias를 유지한다.  
**신규 컴포넌트에서는 alias 사용 금지** — 오른쪽 정식 토큰을 사용.

| alias (구) | 정식 토큰 (신) |
|---|---|
| `$color-primary-bg` | `$color-primary-light` |
| `$color-amber` | `$color-accent` |
| `$color-amber-bg` | `$color-accent-subtle` |
| `$color-error` | `$color-danger` |
| `$color-error-bg` | `$color-danger-subtle` |
| `$color-success-bg` | `$color-success-subtle` |
| `$color-text-weak` | `$color-text-muted` |
| `$color-text-secondary` | (보존 — 별도 역할) |
| `$color-surface-subtle` | `$color-bg-soft` |
| `$color-bg` | `$color-surface` |

---

## 10. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-30 | 메인 컬러 Fin Orange(`#ff6b00`) → Indigo(`#4a3d99`) 전환, 테마 editorial 확정 |
| 2026-05-06 | 컬러 팔레트 v2 — primary 8종, accent 3종, warning/danger/info 신설, neutral 퍼플 틴트 통일 |
