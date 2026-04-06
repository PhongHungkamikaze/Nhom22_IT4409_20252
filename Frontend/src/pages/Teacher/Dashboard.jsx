import React from 'react';
import { Link } from 'react-router-dom';
import './Teacher.css';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Dashboard.css'; // Reuse common dashboard styles

export default function Dashboard() {
    const stats = [
        { title: 'My Quizzes', value: 8, icon: '📝', color: 'blue' },
        { title: 'Enrolled Students', value: 145, icon: '👨‍🎓', color: 'green' },
        { title: 'Total Attempts', value: 632, icon: '🎯', color: 'purple' },
        { title: 'Avg. Score', value: '76%', icon: '⭐', color: 'orange' },
    ];

    const upcomingQuizzes = [
        { id: 1, title: 'React Performance', code: 'REACT-01', date: 'Tomorrow, 10:00 AM', status: 'upcoming' },
        { id: 2, title: 'CSS Grid Mastery', code: 'CSS-02', date: 'Oct 25, 2:00 PM', status: 'draft' },
        { id: 3, title: 'JS Async/Await', code: 'JS-03', date: 'Oct 30, 9:00 AM', status: 'active' },
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Teacher Dashboard</h1>
                    <p className="admin-subtitle">Manage your quizzes and track student progress.</p>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="stats-container">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`stat-card stat-${stat.color}`}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-info">
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-main">
                    <div className="admin-card">
                        <div className="card-header-flex">
                            <h2 className="card-title">My Quizzes</h2>
                            <button className="text-btn">View All</button>
                        </div>
                        <ul className="quiz-list">
                            {upcomingQuizzes.map(quiz => (
                                <li key={quiz.id} className="quiz-item">
                                    <div className="quiz-info">
                                        <h4>{quiz.title} <span className="quiz-code">{quiz.code}</span></h4>
                                        <p>{quiz.date}</p>
                                    </div>
                                    <span className={`quiz-badge badge-${quiz.status}`}>
                                        {quiz.status.toUpperCase()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="admin-card quick-actions">
                        <h2 className="card-title">Quản lý Model</h2>
                        <div className="actions-grid">
                            <Link to="/teacher/quizzes" className="action-btn" style={{textDecoration: 'none'}}>
                                <span className="action-icon">📋</span>
                                Quản lý Quiz
                            </Link>
                            <Link to="/teacher/questions" className="action-btn" style={{textDecoration: 'none'}}>
                                <span className="action-icon">📝</span>
                                Ngân hàng Câu hỏi
                            </Link>
                            <Link to="/teacher/attempts" className="action-btn" style={{textDecoration: 'none', gridColumn: 'span 2'}}>
                                <span className="action-icon">👀</span>
                                Chấm điểm / Review Attempts
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
