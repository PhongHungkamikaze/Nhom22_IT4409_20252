# 📁 Frontend Structure - Online Quiz System

```bash
src/
├── 📁 assets/                 # Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── 📁 components/             # Reusable UI components
│   ├── 📁 common/             # Generic (dumb components)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── LoadingSpinner/
│   │   └── Input/
│   │
│   ├── 📁 layout/             # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Layout.jsx
│   │   └── index.js
│   │
│   ├── 📁 quiz/               # Quiz-related components
│   │   ├── QuizCard.jsx
│   │   ├── QuizForm.jsx
│   │   ├── Timer.jsx
│   │   └── index.js
│   │
│   ├── 📁 question/
│   │   ├── QuestionItem.jsx
│   │   ├── QuestionForm.jsx
│   │   └── index.js
│   │
│   ├── 📁 attempt/
│   │   ├── AttemptCard.jsx
│   │   ├── AnswerSheet.jsx
│   │   └── index.js
│   │
│   └── index.js
│
├── 📁 pages/                  # Route-level pages
│   ├── 📁 Homepage/
│   │   ├── Homepage.jsx
│   │   └── index.js
│   │
│   ├── 📁 Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── index.js
│   │
│   ├── 📁 Admin/
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Quizzes.jsx
│   │   ├── Questions.jsx
│   │   ├── Attempts.jsx
│   │   ├── Analytics.jsx
│   │   └── index.js
│   │
│   ├── 📁 Teacher/
│   │   ├── Dashboard.jsx
│   │   ├── MyQuizzes.jsx
│   │   ├── CreateQuiz.jsx
│   │   ├── EditQuiz.jsx
│   │   ├── QuestionBank.jsx
│   │   ├── Attempts.jsx
│   │   ├── ReviewAttempt.jsx
│   │   └── index.js
│   │
│   ├── 📁 Student/
│   │   ├── Dashboard.jsx
│   │   ├── QuizList.jsx
│   │   ├── QuizDetail.jsx
│   │   ├── TakeQuiz.jsx
│   │   ├── Result.jsx
│   │   ├── History.jsx
│   │   └── index.js
│   │
│   └── 📁 NotFound/
│       └── NotFound.jsx
│
├── 📁 routes/                 # Routing + RBAC
│   ├── AppRouter.jsx
│   ├── ProtectedRoute.jsx
│   ├── AdminRoute.jsx
│   ├── TeacherRoute.jsx
│   └── StudentRoute.jsx
│
├── 📁 services/               # API calls
│   ├── apiClient.js           # axios config
│   ├── authService.js
│   ├── userService.js
│   ├── quizService.js
│   ├── questionService.js
│   ├── attemptService.js
│   └── answerService.js
│
├── 📁 store/                  # (Optional - Redux/Zustand)
│   ├── authSlice.js
│   ├── quizSlice.js
│   └── index.js
│
├── 📁 context/                # React Context
│   ├── AuthContext.jsx
│   ├── QuizContext.jsx
│   └── index.js
│
├── 📁 hooks/                  # Custom hooks
│   ├── useAuth.js
│   ├── useQuiz.js
│   └── useDebounce.js
│
├── 📁 utils/                  # Helper functions
│   ├── constants.js           # ROLE, API URL...
│   ├── formatDate.js
│   ├── validation.js
│   ├── permissions.js         # RBAC logic
│   └── calculateScore.js
│
├── 📁 styles/                 # Global styles
│   ├── globals.css
│   ├── variables.css
│   └── components.css
│
├── App.jsx                    # Root component
├── main.jsx                   # Entry point
└── index.css
```
