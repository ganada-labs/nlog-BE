# nlog-BE

nlog 백엔드 레포

## API 문서

https://ganada-labs.github.io/nlog-BE/

## 폴더 구조

```bash
📦src
├ 📂constants         # 상수
├ 📂infrastructures   # DB등 외부 repository 추상화 (infra)
├ 📂middlewares       # presentation 로직 모듈 모음 (presentation)
├ 📂models            # 스키마 등의 도메인 로직 모음 (domain)
├ 📂packages          # 외부 패키지의 추상화 (infra)
├ 📂router            # 라우팅 로직의 추상화 (presentation)
├ 📂services          # 비지니스 로직 모음 (application)
└ 📂utils             # 유틸함수 모음
```
