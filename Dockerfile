# Python 기반 이미지 사용
FROM python:3.10

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 설치 (없으면 이 줄은 생략 가능)
COPY requirements.txt ./
RUN pip install -r requirements.txt || true

# 전체 소스 복사
COPY . .

# 포트 개방 (Render에 따라 이건 무시되기도 함)
EXPOSE 6000

# 앱 실행 명령어
CMD ["python", "main.py"]
