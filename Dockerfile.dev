# 18 alpine 버전으로 동작
FROM node:18-alpine

# pnpm 설치
RUN npm install -g pnpm

# /app 에서 동작함
WORKDIR /app

# 현재 디렉토리의 내용을 복사함
COPY . .

# 실행
RUN pnpm i
RUN pnpm run build
CMD ["pnpm","run","start:dev"]
