# 16. Campus It 인프라 비용 정리 (v1.0)

> 기준일: 2026-04-28
> Owner: dev1@ajaschool.co.kr (1인 풀스택)
> 적용 대상: ajaschool-mentoring (서비스명 "Campus It", 도메인 `mentoring.ajaschool.com`)
> 비교 리전: AWS ap-northeast-2 (Seoul)

본 문서는 1인 풀스택 MVP 운영 부담을 최소화하기 위해 채택한 인프라 구성과, 정석 풀스택 구성 대비 절감 효과·트레이드오프·정식 런칭(W5+) 전환 비용을 정리한다. 외부 공유(대표·매니저)용 단일 출처.

---

## 한 줄 요약

- 정석 풀스택 인프라 대비 **MVP 월 약 $145 절감 (약 87%↓, 추정)**, 운영 작업 **주 3~4시간 회수**
- 신규 도메인 구매 OUT (영구) — `ajaschool.com` 산하 영구 운영
- AWS 신규 계정 생성 OUT — 기존 ajaschool 계정에 IAM/태그 분리

---

## 1. 시나리오 비교 (월간, ap-northeast-2)

| 항목 | A. 정석 풀스택 | B. MVP 권장 (Dev/Staging) | C. Prod 정식 (W5+) |
|---|---|---|---|
| WAS | ECS Fargate $20 + ALB $25 = **$45** (추정) | **멘토링 전용 EC2 t3.small ~$15** (i-09aff2fb13e32d77f, 신설) | App Runner $56 (추정) |
| DB | RDS PostgreSQL Multi-AZ db.t4g.small **$30** (추정) | RDS db.t4g.micro Single-AZ **$15** (추정) | Multi-AZ **$30** (추정) |
| 캐시 | ElastiCache cache.t4g.micro **$13** (추정) | **OUT $0** | $0 또는 $13 (W5+ 재도입) |
| 프론트 | Vercel Pro **$20** | **동일 EC2 동거 $0** (Next.js production, Docker) | App Runner 또는 EC2 전용 **$0~56** (W5+ 분리 시점 결정) |
| 도메인 | 신규 `.com` 구매 **$15/년** (월 $1.25) | **기존 `ajaschool.com` 재활용 $0** | 동일 $0 |
| ACM SSL | 와일드카드 별도 (실비 $0이지만 별도 발급 운영 비용) | **Certbot Let's Encrypt $0** (EC2 nginx 직접 종단) | 동일 $0 |
| 모니터링 | Datadog 또는 New Relic Standard **$30** | **Sentry 무료 + CloudWatch 기본 메트릭 $0** | 동일 $0 |
| AWS 계정 분리 | 신규 계정 + Organization 관리 부담 | **기존 ajaschool 계정 (IAM/태그 분리)** | 동일 |
| **합계 (월)** | **약 $139~145** | **약 $30** | **약 $106~119** |

> 비용은 모두 **추정**. AWS 가격은 region·약정·트래픽에 따라 변동하며 본 표는 보편 시나리오 기준 가이드 수치. 실제 청구는 월말 CloudWatch Billing Alarm으로 추적.

### 1-1. 추정 근거 (참고)

- RDS db.t4g.micro 베이스 ~$15/월 (1 vCPU·1GB·gp3 20GB 포함, 약정 없음 기준 ~ $11.68 + 스토리지 ~$3)
- RDS db.t4g.small Multi-AZ ~$30/월 (Single-AZ 대비 2배)
- ElastiCache cache.t4g.micro ~$11.68/월 ($0.016/h × 730h)
- App Runner 1 vCPU·2GB ~$56/월 (active container 베이스)
- ALB ~$24~25/월 ($0.0252/h × 730h + 1 LCU 기본)
- Fargate 0.25 vCPU·0.5GB 24/7 ~$10~15/월 (지역 가산 포함)
- Vercel Pro $20/seat/월
- Sentry Developer 무료 티어 (5K errors/월) + CloudWatch 기본 메트릭 무료

---

## 2. 절감 효과 (B 시나리오 vs A) · 1인 개발팀 비용 절감 노력

| # | 항목 | 절감 (월, 추정) | 결정 사유 |
|---|---|---|---|
| 1 | 멘토링 전용 EC2 t3.small 신설 (i-09aff2fb13e32d77f) — 프론트+백엔드 동거 | **$15~30** (ALB 미사용. t3.small ~$15, 메모리 압박 시 t3.medium ~$30) | 기존 ajaschool-dev EC2 공유 계획에서 전용 인스턴스로 변경 (2026-04-30). 메모리 2GB에 swap 2GB 추가, Docker mem_limit(backend 768m / frontend 512m). 80% 지속 시 t3.medium 즉시 격상 |
| 2 | ElastiCache Redis 미도입 | **$13** | PG advisory lock(슬롯 락)·Caffeine in-process(캐시)·HttpOnly cookie+DB row(refresh token)으로 대체. 멀티 인스턴스 진입(W5+) 시 재검토 |
| 3 | ECS·ALB 미사용 | **$45** | 호스트 nginx로 도메인별 reverse proxy. App Runner는 정식 런칭(W5+)에서 도입 |
| 4 | **프론트 별도 호스팅 미사용 — EC2 공유로 통합** | **$20** | Vercel Hobby 비상업 약관 리스크 회피 + 인프라 단일화 + CORS/쿠키 도메인 단순화. 빌드는 GitHub Actions(Docker image → ECR/GHCR), EC2는 pull-and-run. 정식 런칭(W5+) 시 트래픽·메모리 따라 분리 |
| 5 | RDS Single-AZ 시작 | **$15** | Multi-AZ는 정식 런칭(W5+) 전환. 자동 백업 7일 보존으로 단기 장애 복구는 가능 |
| 6 | 신규 도메인 미구매 (`campus-it.com` OUT) | $1.25 (월) / 연 $15 + DNS·콘솔 등록 운영 비용 | 매니저 합의 (2026-04-28). `mentoring.ajaschool.com` 영구 사용. 브랜드명 "Campus It"은 UI에 유지 |
| 7 | 모니터링 단순화 (Sentry 무료 + CloudWatch 기본) | **$30** | Datadog/New Relic Standard 미사용. MVP 트래픽엔 Sentry 무료 티어(5K errors/월)로 충분 |
| 8 | AWS 신규 계정 미생성 | (정량 측정 어려움) | 기존 ajaschool 계정에 IAM/태그(`Project=mentoring`) 분리. Organization 관리·콘솔 분리 운영 부담 0 |
| **합계** | **월 약 $130~145 절감** | **(약 87% 절감, 추정)** | |

---

## 3. 운영 시간 절감 (정성)

| 영역 | 회수 시간 (주) | 비고 |
|---|---|---|
| ECS·ALB·태스크 정의 관리 / 롤링 배포 트러블슈팅 | **2~3시간** | EC2 단일 인스턴스 + Docker Compose `up -d` 단순 운영 |
| ElastiCache 모니터링·노드 재시작·메모리 추적 | **1시간** | Redis 미도입 |
| 신규 도메인 인증서·DNS 전파·외부 콘솔 동시 등록 | **D-30 운영 부담 0** | 카카오·토스·SES 화이트리스트가 `mentoring.ajaschool.com` 한 줄 추가로 끝 |
| AWS 신규 계정 생성·Organization·결제 분리 | **D-30 운영 부담 0** | 기존 ajaschool 계정 활용 |
| **주 회수 합계** | **약 3~4시간** | 1인 풀스택 기준 주 1일치에 근접 |

---

## 4. 트레이드오프 / 리스크

| 리스크 | 영향 | 모니터링 / 대응 |
|---|---|---|
| **EC2 메모리 압박 (t3.small 2GB, 전용 신설)** | backend + frontend 동거 OOM → 서비스 중단 | CloudWatch Memory 알람 80% (5분), Docker mem_limit(backend 768m / frontend 512m), swap 2GB, 알람 시 t3.medium 즉시 격상 (**~$15 → $30/월**) |
| Multi-AZ 부재로 RDS 장애 시 일시 중단 | dev/staging 운영 중단 (분 단위) | dev/staging 한정. 자동 백업 7일 보존. 정식 런칭(W5+) 시 Multi-AZ 격상 |
| 단일 EC2 + Single-AZ → SPOF | 데모·시연 직전 장애 시 영향 | 데모 D-1 헬스체크, 백업 데모 영상 사전 준비 |
| 단일 EC2 + Single-AZ → SPOF | 시연 직전 장애 시 데모 영향 | 데모 D-1에 헬스체크, 백업 데모 영상 사전 준비 |

---

## 5. Prod 정식 런칭(W5+) 전환 계획

| 항목 | 전환 트리거 | 추가 비용 (월, 추정) | 비고 |
|---|---|---|---|
| **프론트 분리** (App Runner 또는 EC2 멘토링 전용) | 트래픽 ↑ 또는 멀티 인스턴스 진입 시. EC2 메모리 80% 지속 도달도 트리거 | **+$0~56** | App Runner(1 vCPU·2GB ~$56) 또는 멘토링 전용 EC2(t3.small ~$15)로 선택. 결정은 트래픽 패턴·운영 부담에 따라 W5+ 시점에 |
| **App Runner 분리 (백엔드)** | W5 첫 주 또는 트래픽 일 50건 도달 | **+$56** (EC2 공유 종료) | 1 vCPU·2GB 기준 |
| **RDS Multi-AZ** | 매출 발생 또는 트래픽 일 50건 도달 | **+$15** | db.t4g.micro Multi-AZ |
| **Redis 재도입** | 멀티 인스턴스 진입 또는 검색·랭킹·Rate limit 부하 | **+$13** | cache.t4g.micro |
| **AWS 계정 분리** | 매출·정산 분리 회계 필요 시점 | $0 (계정 자체는 무료) | Organization으로 결제 통합 가능 |
| **신규 도메인** | (검토 안 함) | — | 매니저 합의로 영구 OUT |
| **W5+ Prod 합계** | | **약 $104~119/월** | |

---

## 6. 환경변수 단일 진실 (도메인 전환 대응)

도메인이 `mentoring-dev.ajaschool.com`(dev) ↔ `mentoring.ajaschool.com`(prod) ↔ 향후 변경 시에도 코드 수정 0을 보장하기 위해 **5개 키로 통일**:

| 키 | 용도 | dev | prod |
|---|---|---|---|
| `APP_BASE_URL` | 프론트 절대 URL (이메일 본문, OAuth redirect 등) | `https://mentoring-dev.ajaschool.com` | `https://mentoring.ajaschool.com` |
| `API_BASE_URL` | 프론트 → 백엔드 호출 | `…/api` | `…/api` |
| `COOKIE_DOMAIN` | refresh token cookie 도메인 | `.ajaschool.com` | `.ajaschool.com` |
| `SES_FROM` | 이메일 발신 주소 | `no-reply@ajaschool.com` | 동일 |
| `ALLOWED_ORIGINS` | 백엔드 CORS 화이트리스트 | dev 도메인 | prod 도메인 |

> 외부 콘솔(카카오 OAuth redirect / 토스 success URL / SES 발신 도메인 검증)도 위 2개 도메인만 등록하면 코드 변경 없이 운영.

---

## 7. AWS 계정·태그 운영 규칙

기존 ajaschool 계정에 멘토링 리소스를 함께 두되, IAM·태그·VPC subnet·보안 그룹으로 격리:

- **태그 표준**: 모든 신규 리소스에 `Project=mentoring`, `Env=dev|prod`, `Owner=dev1@ajaschool.co.kr`
- **IAM**: `MentoringDeveloper` 그룹에 mentoring 리소스만 접근. 기존 ajaschool 콘솔 권한과 분리
- **VPC**: 기존 `vpc-0963373dd409e43ee` 재사용. mentoring 전용 보안 그룹(`sg-mentoring-*`) 신설
- **CloudWatch Billing**: `Project=mentoring` 태그 기반 비용 분리 리포트 (Cost Allocation Tag 활성화)
- **Secrets**: SSM Parameter Store `/mentoring/dev/*` 네임스페이스로 격리

---

## 8. 데모·런칭 의사결정 체크리스트

| 시점 | 의사결정 | 권장 액션 |
|---|---|---|
| W1 D1 | dev EC2 free memory·CPU 점검 | 결과에 따라 t3.medium → t3.large 사전 격상 의사결정 (**$30 → $60/월**, 추정) |
| W1 D2 | Next.js production 컨테이너 + backend 컨테이너 동거 기동 | swap 2GB 추가, `--memory` 제한, nginx server block 라우팅 검증 |
| W2 D5 | dev EC2 메모리 포화도 점검 | 80% 초과 5분 지속 시 t3.large 격상 즉시 |
| W4 D20 (내부 데모) | 데모 직전 Sentry 0건 확인 | 시연 경로 사전 스모크 |
| W5 W6 | 프론트 분리 + App Runner 분리(백엔드) + RDS Multi-AZ | 트래픽·매출·메모리 임계 도달 시 즉시 |

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-28 | 초안 작성. dev EC2 공유 + Redis OUT + Vercel Hobby + 기존 도메인·AWS 계정 결정 반영. 정석 풀스택 대비 MVP 월 약 $130~145 절감(추정), 주 3~4시간 운영 시간 회수 |
| 2026-04-28 | Vercel 미사용 결정 — 프론트도 EC2 공유 (Docker, Next.js production). 사유: Vercel Hobby 비상업 약관 리스크 회피 + 인프라 단일화. 월 비용 합계 변동 없음 (Hobby도 $0이었음). 메모리 압박 안전장치(swap 2GB·`--memory` 제한·CloudWatch 80% 알람·t3.large 사전 격상안) 추가 |
| 2026-04-30 | 기존 ajaschool-dev EC2 공유 → 멘토링 전용 t3.small 신설 (i-09aff2fb13e32d77f, 43.200.163.199). WAS 비용 $0(공유) → ~$15/월(전용). MVP 월 합계 ~$15 → ~$30으로 수정. ACM → Certbot Let's Encrypt 변경. 배포 계획: `plans/deploy-plan.md` |

---

## 참조

- 인프라 스택 SoT: `docs/13-tech-stack.md §24-2 / §24-3 / §24-4`
- 시스템 토폴로지: `docs/02-scope-and-architecture.md §10-3`
- Week 1 인프라 작업 분해: `plans/week1-foundation.md`
- OUT/P1 목록: `plans/4-week-mvp-plan.md §2-2 / §7`
