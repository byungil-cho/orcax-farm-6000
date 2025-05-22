# OrcaX 백엔드

이 프로젝트는 OrcaX NFT 쿠폰 상점(shop.html)에서 발생한 주문 정보를 받아 처리하는 간단한 백엔드 서버입니다.

## 기능
- `/api/notify` 경로로 POST 요청을 받아 주문 정보 처리
- 콘솔 로그 기록
- 향후 DB 연동, 메시지 전송 등 확장 가능

## 실행 방법
```bash
npm install
npm start
```

포트는 기본적으로 `3080`을 사용합니다.