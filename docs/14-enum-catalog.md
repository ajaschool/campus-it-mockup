# 14. Enum · 코드값 중앙 카탈로그

> 프로젝트 전체에서 사용되는 enum(상태값·분기값)을 한 곳에서 관리.
> DB CHECK 제약, Java enum, TypeScript union type, 프론트 드롭다운 라벨은 모두 **이 문서를 Source of Truth**로 함.

값 추가·변경 시 반드시 이 문서를 먼저 수정 후 각 레이어에 반영.

## 1. 사용자·권한

### 1-1. `oauth_provider` (users)
| code | label |
|---|---|
| `KAKAO` | 카카오 |
| `NAVER` | 네이버 |

### 1-2. `user_status` (users)
| code | label |
|---|---|
| `ACTIVE` | 활성 |
| `SUSPENDED` | 정지 |
| `DELETED` | 탈퇴 |

### 1-3. `user_role` (users.role, term_applicable_roles.role)
| code | label |
|---|---|
| `MENTEE` | 멘티 (학생 본인) |
| `PARENT` | 학부모 |
| `MENTOR` | 멘토 |
| `ADMIN` | 관리자 |
| `ALL` | (약관 적용 범위 전용) 전 역할 |

## 2. 멘토

### 2-1. `mentor_status`
| code | label |
|---|---|
| `PENDING` | 승인 대기 |
| `APPROVED` | 승인 완료 (노출) |
| `REJECTED` | 반려 |
| `ON_LEAVE` | 자발적 휴가 (멘토가 설정, 최대 30일, docs/05 §멘토 자발적 일시정지) |
| `SUSPENDED` | 일시 정지 (패널티·수동 조치) |
| `DELETED` | 탈퇴 (soft delete) |

### 2-2. `mentor_grade`
| code | label |
|---|---|
| `FRESHMAN` | 1학년 |
| `SOPHOMORE` | 2학년 |
| `JUNIOR` | 3학년 |
| `SENIOR` | 4학년 이상 |
| `LEAVE` | 휴학 |
| `GRADUATED` | 졸업 |

### 2-3. `admission_type`
| code | label |
|---|---|
| `REGULAR` | 정시 |
| `RECOMM_RECORD` | 수시 학생부교과 |
| `RECOMM_COMPREHENSIVE` | 수시 학생부종합 |
| `ESSAY` | 논술 |
| `PRACTICAL` | 실기 |
| `SPECIAL` | 특별전형 |

### 2-4. `mentor_rejection_code`
| code | label |
|---|---|
| `INSUFFICIENT_DOCS` | 증빙서류 부족 |
| `UNVERIFIED_IDENTITY` | 본인 확인 실패 |
| `INAPPROPRIATE_PROFILE` | 프로필 부적절 |
| `DUPLICATE_ACCOUNT` | 중복 계정 의심 |
| `OTHER` | 기타 (detail 100자 이상 필수) |

### 2-5. `verification_doc_type`
| code | label |
|---|---|
| `ENROLLMENT_CERT` | 재학증명서 |
| `STUDENT_ID` | 학생증 |
| `ADMISSION_CERT` | 합격증 |
| `TRANSCRIPT` | 성적증명 |
| `OTHER` | 기타 |

### 2-6. `mentor_warning_type` (docs/05 §20-5)
| code | label | count_weight | 기본 비율 트리거 |
|---|---|---|---|
| `CANCEL_72H_BEFORE` | 72h 이전 취소 | +1 | 첫 경고는 0%, 이후 누적에 따라 |
| `CANCEL_72H_24H` | 72h~24h 전 취소 | +1 | 현재 카운트 기준 비율 즉시 적용 |
| `CANCEL_UNDER_24H` | 24h 미만 취소 | +2 | 현재 카운트 기준 비율 즉시 적용 |
| `NO_SHOW` | 노쇼 (자동 또는 신고, ADR-001) | +2 | 100% 차감 + 노출 하향. 자동 환불은 `noshow_detection_source` (§4-5)로 출처 기록 |

**누적 비율 테이블** (6개월 롤링 윈도우)
| 누적 카운트 | 비율 | 추가 조치 |
|---|---|---|
| 1 | 5% | — |
| 2 | 10% | — |
| 3 | 20% | 프로필 1개월 정지 |
| 4 | 40% | — |
| 5 | 80% | 계정 정지 |

### 2-7. `mentee_warning_type` (docs/05 §20-8)
| code | label | count_weight |
|---|---|---|
| `NO_SHOW` | 멘티 노쇼 (자동 또는 신고, ADR-001) | +1 |
| `REPEATED_CANCEL` | 상습 취소 (T3-6에서 구체화) | +1 |

**멘티 누적 제재 테이블** (6개월 롤링)
| 누적 카운트 | 조치 |
|---|---|
| 1 | 경고 알림톡 |
| 2 | 경고 알림톡 + 방지 안내 모달 강제 열람 |
| 3 | 신규 예약 24h 쿨다운 |
| 4 | 신규 예약 72h 쿨다운 + 경고 배지 |
| 5 | 계정 30일 정지 |

### 2-8. `mentor_category` (mentor_categories.category)
멘토가 가진 강점·전문 분야 카테고리. 멘토 1명이 복수 선택 가능 (M:N).

| code | label |
|---|---|
| `ADMISSION_CONSULTING` | 진학/입시 |
| `MAJOR_EXPLORATION` | 전공탐색 |
| `SCHOOL_RECORD` | 학생부 |
| `STUDY_METHOD` | 공부법 |
| `MEDICAL_ADMISSION` | 의대입시 |
| `LIBERAL_ARTS` | 인문사회 |
| `STEM` | 자연이공 |
| `ART_SPORTS` | 예체능 |

## 3. 상품·학년

### 3-1. `product_status`
| code | label |
|---|---|
| `ACTIVE` | 판매중 |
| `PAUSED` | 일시중지 |
| `DELETED` | 삭제 |

### 3-2. `grade_code` (product_target_grades.grade_code, pre_surveys.grade)
| code | label |
|---|---|
| `MIDDLE_1` | 중1 |
| `MIDDLE_2` | 중2 |
| `MIDDLE_3` | 중3 |
| `HIGH_1` | 고1 |
| `HIGH_2` | 고2 |
| `HIGH_3` | 고3 |
| `REPEATER` | 재수생 |
| `PARENT_CONSULTATION` | 학부모 상담 |

### 3-3. `score_range` (pre_surveys.current_score_range)
| code | label |
|---|---|
| `TOP_1_PCT` | 최상위권 (1% 이내) |
| `GRADE_1_2` | 1~2등급 |
| `GRADE_3_4` | 3~4등급 |
| `GRADE_5_6` | 5~6등급 |
| `GRADE_7_9` | 7~9등급 |
| `UNKNOWN` | 잘 모름 |

## 4. 예약·세션

### 4-1. `booking_status` (docs/05 §20-1)
| code | label |
|---|---|
| `REQUESTED` | 결제 진행 중 (자동 확정 모델, 30분 내 결제 완료 시 CONFIRMED 전이) |
| `CONFIRMED` | 확정 (결제 완료, 멘토 수락 단계 없음) |
| `RESCHEDULE_PROPOSED` | 일정 변경 제안 대기 |
| `CANCELED` | 멘티 취소 |
| `CANCELED_BY_MENTOR` | 멘토 취소 (패널티 대상) |
| `COMPLETED` | 정상 종료 |
| `NO_SHOW_MENTEE` | 멘티 노쇼 |
| `NO_SHOW_MENTOR` | 멘토 노쇼 |
| `EXPIRED` | 결제 대기 타임아웃 만료 |

> ⚠ `REJECTED` 제거됨 (자동 확정 모델 도입). 멘토는 변경 제안·취소(패널티)만 가능.

### 4-2. `canceled_by` (bookings.canceled_by)
| code | label |
|---|---|
| `MENTEE` | 멘티 |
| `MENTOR` | 멘토 |
| `ADMIN` | 관리자 |
| `SYSTEM` | 시스템 (타임아웃 등) |

### 4-3. `cancellation_reason_code` (docs/05 §20-6)
| code | label |
|---|---|
| `HEALTH` | 건강 문제 |
| `ACADEMIC` | 학업 (시험·수업) |
| `FAMILY` | 가족 사정 |
| `SCHEDULE_CONFLICT` | 일정 중복 실수 |
| `OTHER` | 기타 (detail 100자 이상 필수) |

### 4-4. `time_block_type` (mentor_time_blocks.block_type)
| code | label |
|---|---|
| `AVAILABLE` | 특정일 추가 가능 |
| `BLOCKED` | 특정일 제외 (휴무) |

### 4-5. `noshow_detection_source` (bookings.noshow_detection_source) — ADR-001

노쇼 확정 시 트리거 출처를 구분. docs/05 §20-3-1·§20-3-2 참조.

| code | label | 트리거 |
|---|---|---|
| `AUTO` | 시스템 자동 판정 | 시작 +15분 cron + 입장 row 0 (§20-3-1) |
| `REPORTED` | 사용자 신고 | 시작 +15분 이전 멘티/멘토가 마이페이지 신고 버튼 클릭 (§20-3-2) |
| `BOTH` | 양측 미입장 | 자동 판정 시 양측 입장 row 0 — 양측 노쇼 큐로 분류 |
| `ADMIN_OVERRIDE` | 관리자 수동 | 이의 신청 또는 자동/신고 결과 충돌 시 관리자 검토 후 수동 확정 |

> ⚠ 본 컬럼은 `booking_status ∈ (NO_SHOW_MENTEE, NO_SHOW_MENTOR)` 인 경우에만 NOT NULL. 정상 종료·취소 건은 NULL.

## 5. 결제·정산

### 5-1. `payment_method`
| code | label |
|---|---|
| `CARD` | 신용/체크카드 |
| `EASY_PAY` | 간편결제 (토스/카카오/네이버페이) |
| `TRANSFER` | 계좌이체 |
| `VIRTUAL_ACCOUNT` | 가상계좌 |

### 5-2. `payment_status`
| code | label |
|---|---|
| `PENDING` | 결제 진행중 |
| `DONE` | 승인 완료 |
| `CANCELED` | 취소 (환불 포함) |
| `FAILED` | 실패 |

### 5-3. `refund_reason_code` (refunds.refund_reason_code)
| code | label | policy |
|---|---|---|
| `USER_CANCEL_24H` | 멘티 24h 이전 취소 | FULL |
| `USER_CANCEL_3H` | 멘티 3~24h 취소 | PARTIAL_50 |
| `MENTOR_CANCEL` | 멘토 취소 | FULL |
| `MENTOR_NO_SHOW` | 멘토 노쇼 (시작 +15분 자동 판정, ADR-001) | FULL (자동 트리거) |
| `MENTEE_NO_SHOW` | 멘티 노쇼 (시작 +15분 자동 판정, ADR-001) | ZERO (환불 없음) |
| `BOTH_NO_SHOW` | 양측 노쇼 (양측 입장 0, ADR-001) | FULL (멘티에게 자동 환불) |
| `CLAIM_APPROVED` | 클레임 승인 | FULL 또는 PARTIAL_50 (관리자 판단) |
| `ADMIN_OVERRIDE` | 관리자 수동 처리 | 임의 |

### 5-4. `refund_policy_applied`
| code | label |
|---|---|
| `FULL` | 전액 환불 |
| `PARTIAL_50` | 50% 환불 |
| `ZERO` | 환불 없음 |

### 5-5. `refund_status`
| code | label |
|---|---|
| `PENDING` | 처리 중 |
| `DONE` | 완료 |
| `FAILED` | 실패 |

### 5-6. `coupon_status` (coupons.status) — ADR-002

쿠폰 라이프사이클 상태. docs/07 §21-4 (운영자 수동 발급, 멘티 수동 사용, 자동 발급·만료 알림은 OUT-W5) 기반.

| code | label | 전이 트리거 |
|---|---|---|
| `UNUSED` | 미사용 | 발급 시 default |
| `USED` | 사용됨 | 결제 성공 시 `coupon_redemptions` 적재 → status 갱신 |
| `EXPIRED` | 만료 | `expires_at` 도래 시 cron 또는 결제 검증 시 lazy 판정 |

**전이**: `UNUSED → USED` (결제) | `UNUSED → EXPIRED` (만료) | `USED`·`EXPIRED`는 단방향 종결

**Why ADR-002**: MVP는 자동 발급 cron 없이 운영 수동 발급, 만료는 lazy 판정으로 시작. Week 5+ 자동화 시 상태 머신 그대로 사용 가능.

> ⚠ §21-4 데이터 모델은 현재 `coupons` 테이블에 별도 `status` 컬럼 없이 `coupon_redemptions` 적재 여부 + `expires_at` 비교로 라이프사이클을 도출하는 단순 구조다. 본 enum은 **표시·API 응답 단계의 라벨**(예: 마이페이지 쿠폰함 "미사용/사용됨/만료" 뱃지) Source of Truth로 사용. 물리 컬럼화는 자동 만료 알림 도입(W5+) 시점에 마이그레이션.

## 6. 알림

### 6-1. `notification_channel`
| code | label |
|---|---|
| `EMAIL` | 이메일 |
| `KAKAO_ALIMTALK` | 카카오 알림톡 |
| `SMS` | 단문 |
| `LMS` | 장문 (SMS 폴백) |

### 6-2. `notification_template_code` (docs/06 §11-6)

**알림톡 8종**
| code | 트리거 | 수신자 |
|---|---|---|
| `A01` | 일정 변경 제안 | 상대방 |
| `A02` | 결제 완료 / 예약 확정 (자동 확정) | 멘티·멘토 |
| `A03` | 멘토 상담 링크 등록 완료 | 멘티 |
| `A04` | 3일 전 리마인드 | 양측 |
| `A05` | 당일 리마인드 | 양측 |
| `A06` | 상담 시작 10분 전 | 양측 |
| `A07` | 상담 종료 후 후기 요청 | 멘티 |
| `A08` | 정산 완료 | 멘토 |

**이메일 전용 2종**
| code | 트리거 | 수신자 |
|---|---|---|
| `E01` | 환불 완료 | 멘티 |
| `E02` | 멘토 승인/반려 | 멘토 |

> ⚠ 이전 14종 설계(예약 신청 접수, 멘토 수락, 멘토 거절, 사전질문 리마인드, 환불·승인 알림톡, 클레임)는 자동 확정 모델 + 결제 시점 사전질문 답변 + 1:1 문의 흡수로 모두 제거되고, 현재 코드는 A01~A08로 재번호됨. 상세는 docs/06 참고.

### 6-3. `notification_status`
| code | label |
|---|---|
| `QUEUED` | 발송 대기 |
| `SENT` | 발송 완료 |
| `FAILED` | 실패 |
| `READ` | 확인됨 (확인 버튼 클릭) |

## 7. 약관

### 7-1. `term_code` (terms.code)
| code | label |
|---|---|
| `T01` | 이용약관 |
| `T02` | 개인정보 수집·이용 |
| `T03` | 만 14세 이상 확인 |
| `T04` | 본인인증 정보 제공 |
| `T05` | 멘토 서비스 운영 약관 |
| `T06` | 멘토 정산 정보 수집 |
| `T07` | 멘토 과세 정보 수집 |
| `T08` | 멘토 행동 가이드라인 |
| `T09` | 법정대리인 동의 (만 14세 미만 자녀) |
| `T10` | 마케팅 정보 수신 (선택) |
| `T11` | 이벤트/프로모션 알림 수신 (선택) |
| `T12` | 개인정보 제3자 제공 (선택) |
| `T13` | 전자상거래법 구매조건 확인 |
| `T14` | 결제대행 서비스 이용약관 (토스페이먼츠) |

## 8. 후기

### 8-1. `review_hidden_reason`
| code | label |
|---|---|
| `USER_REQUEST` | 작성자 삭제 요청 |
| `ABUSE` | 악성 후기 |
| `MANIPULATION` | 조작 의심 |
| `INAPPROPRIATE` | 부적절 내용 |
| `ADMIN_DECISION` | 관리자 판단 |

## 9. 클레임 · 문의 (Week 5+ 신규 테이블 스키마)

### 9-1. `claims` 테이블 (docs/11 §13-2)

```sql
CREATE TABLE claims (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id),
  claimant_user_id BIGINT NOT NULL REFERENCES users(id),
  against_user_id BIGINT REFERENCES users(id),
  claim_type VARCHAR(30) NOT NULL CHECK (claim_type IN
    ('TIME_VIOLATION','POOR_QUALITY','FALSE_CREDENTIAL','INAPPROPRIATE_BEHAVIOR','METHOD_MISMATCH','OTHER')),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN
    ('OPEN','UNDER_REVIEW','RESOLVED','DISMISSED')),
  resolution TEXT,
  resolved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_claims_status ON claims(status, created_at);
CREATE INDEX idx_claims_booking ON claims(booking_id);
```

**claim_type 매핑** (docs/11 §13-2 기준)
| code | label |
|---|---|
| `TIME_VIOLATION` | 시간 미준수 |
| `POOR_QUALITY` | 무성의한 진행 |
| `FALSE_CREDENTIAL` | 허위 이력 의심 |
| `INAPPROPRIATE_BEHAVIOR` | 부적절 언행 |
| `METHOD_MISMATCH` | 진행 방식 불일치 |
| `OTHER` | 기타 |

**claim_status**
| code | label |
|---|---|
| `OPEN` | 접수 |
| `UNDER_REVIEW` | 관리자 검토 중 |
| `RESOLVED` | 해결 완료 |
| `DISMISSED` | 기각 |

### 9-2. `inquiries` 테이블 (docs/10 §23-1)

```sql
CREATE TABLE inquiries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  category VARCHAR(20) NOT NULL CHECK (category IN
    ('ACCOUNT','PAYMENT','BOOKING','OTHER')),
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN
    ('OPEN','ANSWERED','CLOSED')),
  answered_by BIGINT REFERENCES users(id),
  answer_body TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMP
);

CREATE INDEX idx_inquiries_user ON inquiries(user_id, created_at DESC);
CREATE INDEX idx_inquiries_status ON inquiries(status, created_at);
```

**inquiry_category**
| code | label |
|---|---|
| `ACCOUNT` | 계정 |
| `PAYMENT` | 결제 |
| `BOOKING` | 예약 |
| `OTHER` | 기타 |

**inquiry_status**
| code | label |
|---|---|
| `OPEN` | 접수 |
| `ANSWERED` | 답변 완료 |
| `CLOSED` | 종료 |

## 10. 운영 원칙

- 모든 enum은 **DB CHECK 제약으로 1차 방어**
- Java: `enum` 또는 `@Converter`로 매핑. `VARCHAR` 직접 노출 금지
- TypeScript: `export type XxxCode = 'A' | 'B';` union type + 라벨 맵 객체 병행
  ```ts
  export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
    REQUESTED: '신청',
    CONFIRMED: '확정',
    // ...
  };
  ```
- 프론트 드롭다운은 위 라벨 맵에서 자동 생성. 하드코딩 금지
- 값 추가 시:
  1. 이 문서 갱신 (Source of Truth)
  2. `db/schema/` 폴더에 새 SQL 파일 추가 (`add-enum-xxx.sql`)로 CHECK 제약 교체
  3. Java enum에 값 추가
  4. TS union type 및 라벨 맵 갱신
  5. 기존 데이터 백필 스크립트 (있다면, `db/data-fix/` 등 별도 폴더)
