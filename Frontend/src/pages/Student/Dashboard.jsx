import React from 'react';
import { Link } from 'react-router-dom';
import './Student.css';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Dashboard.css'; // Reuse common dashboard styles

export default function Dashboard() {
    const activeQuizzes = [
        { id: 1, title: 'Introduction to React', teacher: 'Sarah Connor', duration: '45 mins', questions: 20 },
        { id: 2, title: 'Advanced CSS Structures', teacher: 'Harvey Specter', duration: '30 mins', questions: 15 },
    ];

    const recentResults = [
        { id: 1, title: 'JavaScript Basics', score: '85%', date: 'Oct 20, 2025', pass: true },
        { id: 2, title: 'HTML5 Semantic Web', score: '92%', date: 'Oct 18, 2025', pass: true },
        { id: 3, title: 'Node.js intro', score: '55%', date: 'Oct 15, 2025', pass: false },
    ];

    return (
        <div className="admin-container student-dashboard">
            <header className="admin-header user-welcome">
                <div>
                    <h1 className="admin-title">Hello, Alex! 👋</h1>
                    <p className="admin-subtitle">Ready to learn something new today?</p>
                </div>
            </header>

            <div className="dashboard-grid student-grid">
                {/* Available Quizzes Area */}
                <div className="admin-card available-quizzes">
                    <div className="card-header-flex">
                        <h2 className="card-title">Available Quizzes</h2>
                        <button className="text-btn">View All</button>
                    </div>
                    <div className="student-quiz-grid">
                        {activeQuizzes.map(quiz => (
                            <div key={quiz.id} className="student-quiz-card">
                                <div className="quiz-card-content">
                                    <h3>{quiz.title}</h3>
                                    <p className="teacher-name">By {quiz.teacher}</p>
                                    <div className="quiz-meta">
                                        <span>⏱️ {quiz.duration}</span>
                                        <span>📝 {quiz.questions} Qs</span>
                                    </div>
                                </div>
                                <button className="start-btn">Start Quiz</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Results Area */}
                <div className="admin-card recent-results">
                    <h2 className="card-title">Recent Results</h2>
                    <ul className="result-list">
                        {recentResults.map(result => (
                            <li key={result.id} className="result-item">
                                <div className="result-info">
                                    <h4>{result.title}</h4>
                                    <span className="result-date">{result.date}</span>
                                </div>
                                <div className="result-score">
                                    <span className={`score-badge ${result.pass ? 'pass' : 'fail'}`}>
                                        {result.score}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Navigation Panel for Models */}
                <div className="admin-card quick-actions" style={{gridColumn: '1 / -1'}}>
                    <h2 className="card-title">Quản lý Học tập (Models)</h2>
                    <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <Link to="/student/quizzes" className="action-btn" style={{textDecoration: 'none'}}>
                            <span className="action-icon">📚</span>
                            Danh sách Bài Quiz
                        </Link>
                        <Link to="/student/history" className="action-btn" style={{textDecoration: 'none'}}>
                            <span className="action-icon">📊</span>
                            Kết quả & Lịch sử
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
