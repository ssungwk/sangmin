# 판매관리시스템

로그인 후 매입등록/매출등록을 처리하고 매입가, 판매가, 마진율을 관리하는 웹 서비스입니다. PWA로 구성되어 있어 안드로이드에서 홈 화면에 설치해 앱처럼 사용할 수 있습니다.

- **프론트엔드**: Next.js (App Router) + Tailwind CSS
- **백엔드/DB/인증**: Supabase (Postgres)
- **배포**: Vercel

## 로컬 개발 준비

1. 의존성 설치

   ```bash
   npm install
   ```

2. `.env.local.example`을 복사해 `.env.local` 생성 후 Supabase 프로젝트의 URL/anon key 입력

   ```bash
   cp .env.local.example .env.local
   ```

3. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql` 실행 (테이블/트리거/RLS 정책 생성)

4. (선택) 회원가입 승인 알림 메일을 보내려면 [resend.com](https://resend.com)에서 무료 API Key 발급 후 `.env.local`의 `RESEND_API_KEY`에 입력. 미설정 시 승인 자체는 정상 동작하고 메일만 생략됩니다.

5. 개발 서버 실행

   ```bash
   npm run dev
   ```

## 배포

Supabase / GitHub / Vercel 연결 방법은 프로젝트 설명에서 별도로 안내합니다.
