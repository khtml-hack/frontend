```
peak-down/
├── index.html # Vite 진입 HTML
├── vite.config.js # Vite 설정 파일
├── package.json # 의존성 & 스크립트
├── tailwind.config.js # Tailwind 설정
├── postcss.config.js # PostCSS 설정
├── node_modules/
├── public/ # 정적 파일 (파비콘, 이미지 등)
│ └── logo.png
└── src/
├── assets/ # 이미지, 아이콘, 폰트 등
│ └── images/
├── components/ # UI 컴포넌트 (역할별 구조화)
│ ├── common/ # Button, Header, Modal 등 공통
│ ├── mission/ # MissionCard, MissionResultBanner 등
│ ├── map/ # 지도 관련 컴포넌트
│ ├── store/ # 제휴 상점 관련 컴포넌트
│ └── reward/ # 포인트/QR 관련 컴포넌트
├── pages/ # 라우팅되는 실제 페이지 단위
│ ├── Home.jsx
│ ├── MissionResult.jsx
│ ├── PartnerStores.jsx
│ ├── StoreDetail.jsx
│ ├── QRUse.jsx
│ ├── PointHistory.jsx
│ ├── MyPage.jsx
│ └── Login.jsx
├── hooks/ # 커스텀 훅
│ ├── useUserLocation.js
│ ├── useMissionData.js
│ ├── useReward.js
│ └── useStoreData.js
├── context/ # Context API 관리
│ ├── UserContext.jsx
│ └── RewardContext.jsx
├── api/ # API 호출 로직
│ ├── missionApi.js
│ ├── storeApi.js
│ └── rewardApi.js
├── utils/ # 공통 유틸 함수
│ ├── formatTime.js
│ └── calculatePoints.js
├── styles/ # Tailwind 및 글로벌 CSS
│ ├── tailwind.css # Tailwind @import base
│ └── global.css # reset + custom css
├── App.jsx # 루트 라우터 & 컴포넌트 설정
└── main.jsx # 진입점 (ReactDOM + Router)
```

```
개발자 A (이우주) - 사용자흐름, 홈, 미션, 지도, QR
개발자 B (홍시은) - 상점과 포인트 중심, 제휴상점, 보상
```
