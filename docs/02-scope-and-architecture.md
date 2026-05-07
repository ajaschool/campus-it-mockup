# 02. MVP 범위 및 정보 구조

## 8. MVP 범위

### 8-1. 포함 범위

- 소셜 로그인 (카카오/네이버) 및 휴대폰 본인인증
- 필수/선택 약관 동의
- 멘토 등록 및 검증
- 멘토 프로필 생성/노출
- 멘토링 카테고리 구조
- 멘토링 상품 등록
- 멘토 탐색/검색 (찜·최근 본 멘토 포함)
- 멘토 상세 페이지
- 상담 신청/예약
- 일정 조율
- 결제 (토스페이먼츠 단독, 현금영수증, 쿠폰)
- 카톡 기반 알림 + SMS 폴백
- 상담 완료 처리
- 후기/평점
- 정산 관리
- 멘토/멘티/관리자 대시보드
- FAQ/공지사항/1:1 고객센터
- 관리자 운영 페이지

### 8-2. MVP 운영 제약

- 대학은 3개 대학 중심
- 학과는 단과대 기반
- 대표 학과 멘토 우선 확보
- 멘토링은 30분 기준
- 진행 채널은 Zoom/Google Meet 등 외부 툴 사용
- 가격은 **멘토 자율 책정 + 관리자 설정 최저가~최고가 범위** 내 (`platform_settings.price_min/max`). 29,900원은 UI 권장가(기본값)만 (ADR-003)
- 수익 분배는 50:50 기준 검증

## 9. 정보 구조

### 9-1. 탐색 방식
3가지 축으로 제공:

1. 대학 → 단과대 → 멘토
2. 단과대/주제 → 대학 → 멘토
3. 인기 멘토/추천 멘토 중심 탐색

### 9-2. 멘토링 카테고리
- 진학/입시 상담
- 공부법/내신 관리
- 전공/계열 탐색
- 학생부/활동 방향
- 학교생활/대학생활 Q&A
- 학부모 상담형 멘토링

### 9-3. 대학/학과 구조
- MVP는 3개 대학
- 단과대 기준 노출
- 각 단과대별 대표 학과 멘토 확보
- 자율 주제형 멘토링 섹터 병행 가능

## 10. 사용자 시나리오

### 10-1. 학생/학부모 예약 시나리오
1. 사용자가 메인에서 멘토링 탐색
2. 대학/단과대/주제/인기 멘토 기준으로 필터링
3. 멘토 상세 확인
4. 멘토링 상품 선택
5. 희망 일정 선택
6. 학생 정보/고민 입력
7. 부모 결제 또는 본인 결제 진행
8. 예약 확정 알림 수신
9. 멘토링 진행
10. 후기 작성

### 10-2. 멘토 등록 시나리오
1. 멘토 회원가입
2. 기본 정보 입력
3. 증빙 서류 제출
4. 관리자 검수
5. 승인 후 프로필 생성
6. 가능 시간 등록
7. 멘토링 상품 등록
8. 신청 건 확인 및 수락/조율
9. 멘토링 진행
10. 정산 수령

## 10-3. 시스템 토폴로지 (MVP 시작 시점)

> 상세 비용·근거: `docs/16-infrastructure-cost.md` · 스택 표: `docs/13-tech-stack.md §24-2`

```
[ 사용자 브라우저 ]
        │
        ▼  HTTPS (mentoring.ajaschool.com / mentoring-dev.ajaschool.com)
[ AWS Route53 / ACM 와일드카드 *.ajaschool.com ]
        │
        ▼
[ ajaschool-dev EC2 (t3.medium, EIP 3.37.109.156) ]
   ├── nginx (호스트, reverse proxy)
   │     · Host 헤더로 mentoring vs dev.ajaschool 분기
   │     · /api/*          → backend container :8080
   │     · /_next/static/* → nginx caching (1y immutable)
   │     · /               → frontend container :3000 (Next.js production)
   ├── Docker Compose
   │     ├── ajaschool-mentoring-back  (Spring Boot, --memory 1024m)
   │     ├── ajaschool-mentoring-front (Next.js production, --memory 512m)
   │     └── (기존 ajaschool dev 서비스들 유지)
   ├── swap 2GB (OOM 비상안)
   └── CloudWatch Agent (Memory 80% / CPU / Disk 알람)
        │
        ▼
[ RDS PostgreSQL 16 · db.t4g.micro Single-AZ (신규, private subnet, 같은 VPC) ]
[ S3 + CloudFront (증빙·프로필 이미지) ]
[ AWS SES (이메일 알림 — 알림톡 심사 전 폴백) ]

빌드 흐름: GitHub Actions → Docker image build → ECR/GHCR push → EC2 pull-and-run

※ Vercel · Redis · ElastiCache · ALB · ECS Fargate 모두 미사용 (MVP)
   슬롯 동시성 락 → PG advisory lock
   refresh token → HttpOnly cookie + DB row
   hot path 캐시 → Caffeine in-process
```

**Prod 정식 런칭(W5+) 전환 시**: 백엔드 App Runner 분리, 프론트도 분리(App Runner 또는 EC2 멘토링 전용), RDS Multi-AZ 격상, 멀티 인스턴스 진입 시 Redis 재도입.

## 10-4. ERD 정책 메모 (결제자/이용자 분리, ADR-002)

학부모-자녀 결제·결제대행 시나리오를 일관되게 처리하기 위해 `bookings` 테이블에 **결제자(payer)와 이용자(user)를 별도 컬럼으로 보유**한다.

### 컬럼 설계

```sql
-- bookings 테이블 일부 (Week 3 정의 시점에 반영)
user_id   BIGINT NOT NULL REFERENCES users(id),  -- 이용자 (실제 멘토링 받는 사람)
payer_id  BIGINT NOT NULL REFERENCES users(id),  -- 결제자 (카드·계좌 소유자)
```

### 케이스 매핑

| 케이스 | `user_id` | `payer_id` | 비고 |
|---|---|---|---|
| 멘티 본인 결제 (만 14세+) | 멘티 user_id | 동일 (멘티 user_id) | 일반 케이스. 두 값이 같음 |
| 학부모 결제 (자녀 멘토링) | 자녀 user_id (자녀 프로필이 별도 user 계정으로 노드 분기 — 만 14세 미만 자녀는 학부모와 같은 user 또는 child profile 분기) | 학부모 user_id | 만 14세 미만 자녀는 학부모 user 또는 별도 child user 식별자 운영 (구체 매핑은 백엔드 진입 시 확정) |
| 향후 결제대행 (W5+) | 이용자 user_id | 대행 결제자 user_id | 동일 컬럼으로 커버. 별도 스키마 변경 없음 |

### 관련 테이블

- `payments` 테이블은 **토스페이먼츠 transaction 기록 전용**으로 별도 유지. `booking_id` FK + `payer_id` 참조(billing_key·card_company·approval_no 등 PG 메타 보유).
- `refunds` 테이블도 `booking_id` FK 유지하되, 환불 송금 대상은 `payer_id` 기준(토스 환불 API는 원 결제 트랜잭션을 역순 호출하므로 자동으로 payer 카드/계좌로 복귀).

### Why 분리 컬럼 채택

- 학부모-자녀 후기·노쇼·환불 알림 발송 시 결제자/이용자 동시 식별 필요 → `bookings`에서 직접 조인 가능해야 함
- 별도 `payment_payer` 정규화 테이블은 1:1 관계 + 매번 조인 비용 발생 → booking에 컬럼 2개 두는 게 단순
- 일반 케이스(`payer_id = user_id`)는 INSERT 시 두 값을 같게 채워 넣어 분기 코드 없이 통일 처리

### 정합성 규칙

- `bookings.payer_id` NOT NULL 강제 (모든 booking은 결제자 식별 가능해야 함)
- 만 14세 미만 자녀 booking은 서버 검증으로 `payer_id ≠ user_id` AND `payer_id`의 role = `PARENT` 강제
- 정산 통계는 `mentor_id` × `created_at` 기준 (payer 무관). 환불 송금 송신자는 항상 `payer_id`

근거: docs/11 ADR-002 (§ERD-payer 클로즈)
