# Node.js 기반 베이스 이미지 선택
FROM node:18

# 작업 디렉토리 생성
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 나머지 파일 전체 복사
COPY . .

# 포트 오픈 (예: 3004)
EXPOSE 3004

# 서버 실행 명령어
CMD ["node", "index.js"]
