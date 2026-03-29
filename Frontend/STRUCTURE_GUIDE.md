# 📁 HƯỚNG DẪN TỔ CHỨC LẠI CẤU TRÚC FRONTEND

src/
├── 📁 components/           # Component tái sử dụng
│   ├── 📁 Header/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   └── index.js        # Export file
│   ├── 📁 LoadingSpinner/
│   ├── 📁 Button/
│   └── 📁 Modal/
│
├── 📁 pages/               # Các trang chính 
│   ├── 📁 Homepage/
│   │   ├── Homepage.jsx
│   │   ├── Homepage.css
│   │   └── index.js
│   ├── 📁 Login/
│   ├── 📁 QuizDetail/
│   └── 📁 Dashboard/
│
├── 📁 services/            # API & External calls
│   ├── api.js             # Main API service
│   ├── auth.js            # Auth related
│   └── quiz.js            # Quiz related
│
├── 📁 styles/              # CSS toàn cục
│   ├── globals.css        # Reset, variables
│   ├── components.css     # Shared component styles
│   └── variables.css      # CSS variables
│
├── 📁 utils/               # Helper functions
│   ├── formatDate.js
│   ├── validation.js
│   └── constants.js
│
├── 📁 hooks/               # Custom React hooks
│   ├── useAuth.js
│   └── useQuiz.js
│
├── 📁 context/             # React Context
│   ├── AuthContext.js
│   └── QuizContext.js
│
├── 📁 assets/              # Images, fonts, static
│   ├── 📁 images/
│   ├── 📁 icons/
│   └── 📁 fonts/
│
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Root styles
