# 13. 기술 스택 · 인프라

## 24. 기술 스택 및 인프라 (v1.2)

### 24-1. 프레임워크
- **Backend**: Java 21 + Spring Boot 3.x
- **Frontend**: Next.js 15.x **Pages Router** + TypeScript + SCSS Modules
- 상태관리: Redux Toolkit + redux-persist (인증/세션) · React Query (서버 상태)
- HTTP: Axios (인터셉터로 토큰 갱신, 401 재시도 패턴)
- 구조: Entity 패턴 (`src/entities/{mentor, session, review, ...}/api`) — aja-front 기존 프로젝트 컨벤션과 통일
- 아자스쿨 기존 플랫폼(`aja-front`/`aja-back`)의 도구·구조 컨벤션 재사용 (커머스 로직은 배제)

### 24-2. 인프라 (AWS ap-northeast-2 기준 · MVP/Dev·Staging)

> 1인 풀스택 MVP 운영 부담 최소화 + 비용 절감 원칙. 정식 런칭(W5+)에 선택적 격상.
> 비용 상세: `docs/16-infrastructure-cost.md` 참조

| 영역 | MVP 선택 (Dev/Staging) | Prod 정식(W5+) | 비고 |
|---|---|---|---|
| WAS | **멘토링 전용 EC2 신설** (Docker Compose) | App Runner 분리 | `i-09aff2fb13e32d77f`, t3.small 2GB, 퍼블릭IP `43.200.163.199` (EIP 미할당→할당 예정), VPC `vpc-0963373dd409e43ee`, IAM `mentoring-ec2-role` (예정). 호스트 nginx reverse proxy. 배포계획: `plans/deploy-plan.md` |
| Web | **동일 EC2 동거 (Docker, Next.js production)** — 도메인 `mentoring-dev.ajaschool.com` | App Runner 또는 EC2 전용 (W5+ 분리 시점 결정) | 빌드는 GitHub Actions (Docker image → GHCR push), EC2는 pull-and-run. nginx: `/api/*`→:8080, `/_next/static/*`→nginx cache, `/`→:3000. SSL: Certbot Let's Encrypt (EC2 nginx 직접 종단). 메모리 압박 모니터링 §16-4 |
| DB | **RDS PostgreSQL 16 db.t4g.micro Single-AZ** (별도 인스턴스 신설) | Multi-AZ 격상 | 같은 VPC, private subnet. EC2 내부 PG 미사용 |
| 캐시 | **MVP OUT** — PG advisory lock + Caffeine in-process | Redis 재도입 (W5+ 멀티 인스턴스 진입 시) | 슬롯 락은 advisory lock, refresh token은 HttpOnly cookie + DB row, hot path 캐시는 Caffeine |
| 파일 | S3 + CloudFront | 동일 | 증빙서류, 프로필 이미지 |
| 검색 | DB full-text (MVP) → OpenSearch (P1) | OpenSearch | 3개 대학 MVP에선 DB 수준으로 충분 |
| CI/CD | GitHub Actions | 동일 | |
| 모니터링 | CloudWatch + Sentry (무료 티어) | 동일 | Memory/CPU/Disk 알람 EC2 공유 운영 필수 |
| AWS 계정 | **기존 ajaschool 계정** | 동일 | IAM/태그(`Project=mentoring`)로 분리. 신규 계정 미생성 |
| SSL | **기존 와일드카드 ACM `*.ajaschool.com` 재활용** | 동일 | 신규 인증서 발급 불필요 |

### 24-3. 외부 연동 · 도메인

| 영역 | 선택 | 비고 |
|---|---|---|
| 결제 | 토스페이먼츠 | 멘토링 전용 MID 분리 발급 (기존 쇼핑몰 MID `ajaschqcno`와 별도). 동일 사업자번호로 추가 발급, 발급 자체는 무료. 업종(용역/교육) 차이로 수수료율은 기존 대비 소폭 차이 가능 |
| 알림 | 카카오 알림톡 | NHN Toast Bizmessage 또는 알리고 |
| 본인인증 | PASS 또는 NICE | |
| 소셜 로그인 | 카카오, 네이버 | |
| 화상 | Zoom / Google Meet | 링크 저장만, 자체 개발 제외. **상담 링크 도메인 화이트리스트**: `zoom.us` / `meet.google.com` 만 허용 |

#### 24-3-1. 도메인 정책

| 항목 | 값 |
|---|---|
| 운영 도메인 | `mentoring.ajaschool.com` (영구) |
| Dev/Staging 도메인 | `mentoring-dev.ajaschool.com` |
| 신규 도메인 (`campus-it.com` 등) 구매 | **OUT — 영구** (매니저 합의, 2026-04-28) |
| 브랜딩 | "Campus It" 서비스명은 UI·로고·약관 본문에 그대로 유지. 도메인은 ajaschool 산하지만 사용자 노출 브랜드는 Campus It |
| 외부 콘솔 등록 | 카카오·토스·SES에 위 2개 도메인 등록. 콜백 URL·발신 도메인·CORS Origin 모두 환경변수 5개(`APP_BASE_URL`/`API_BASE_URL`/`COOKIE_DOMAIN`/`SES_FROM`/`ALLOWED_ORIGINS`)로 통일 |

### 24-4. 환경변수 단일 진실

도메인·호스트가 변경되어도 코드 수정이 없도록 5개 키로 통일:

| 키 | dev | prod |
|---|---|---|
| `APP_BASE_URL` | `https://mentoring-dev.ajaschool.com` | `https://mentoring.ajaschool.com` |
| `API_BASE_URL` | `https://mentoring-dev.ajaschool.com/api` | `https://mentoring.ajaschool.com/api` |
| `COOKIE_DOMAIN` | `.ajaschool.com` | `.ajaschool.com` |
| `SES_FROM` | `no-reply@ajaschool.com` | `no-reply@ajaschool.com` |
| `ALLOWED_ORIGINS` | `https://mentoring-dev.ajaschool.com` | `https://mentoring.ajaschool.com` |

## §History

| 날짜 | 변경 | 사유 |
|---|---|---|
| 2026-04-28 | 인프라 단순화 — Redis OUT, Dev EC2 공유, Vercel, Single-AZ. 신규 도메인 구매 OUT | 1인 풀스택 MVP 운영 부담 최소화 + 비용 절감. 상세 비용 비교 `docs/16-infrastructure-cost.md` |
| 2026-04-28 | Vercel 미사용 결정 — 프론트도 EC2 공유 (Docker, Next.js production) | Vercel Hobby 비상업 약관 리스크 회피 + 인프라 단일화 (CORS·쿠키 도메인 단순화). 빌드는 GitHub Actions, EC2는 pull-and-run |
| 2026-04-30 | 기존 ajaschool-dev EC2 공유 계획 → 멘토링 전용 EC2 t3.small 신설로 변경 | 신규 인스턴스 `i-09aff2fb13e32d77f` 생성 확인 (2GB RAM, 43.200.163.199). ajaschool-dev 영향 격리, ACM → Certbot Let's Encrypt 변경 |
