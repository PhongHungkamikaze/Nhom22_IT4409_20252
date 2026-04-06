import React, { useState } from 'react';
import './Teacher.css';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Users.css'; // Reuse table styles

export default function MyQuizzes() {
    const [searchTerm, setSearchTerm] = useState('');

    const [quizzes] = useState([
        { id: 1, title: 'React Fundamentals', code: 'REACT-01', duration: '45 mins', questions: 20, status: 'Active', enrolled: 125, avgScore: '82%' },
        { id: 2, title: 'CSS Layouts', code: 'CSS-02', duration: '30 mins', questions: 15, status: 'Active', enrolled: 95, avgScore: '75%' },
        { id: 3, title: 'Node.js Basics', code: 'NODE-01', duration: '60 mins', questions: 30, status: 'Draft', enrolled: 0, avgScore: '-' },
        { id: 4, title: 'JS Asynchronous', code: 'JS-03', duration: '45 mins', questions: 25, status: 'Upcoming', enrolled: 42, avgScore: '-' },
    ]);

    const filteredQuizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">My Quizzes</h1>
                    <p className="admin-subtitle">Create, manage, and monitor your quiz exams.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">✨</span> Create New Quiz
                </button>
            </header>

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by title or code..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Quiz Information</th>
                                <th>Duration</th>
                                <th>Questions</th>
                                <th>Status</th>
                                <th>Performance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuizzes.map(quiz => (
                                <tr key={quiz.id}>
                                    <td>
                                        <div className="quiz-name-cell">
                                            <strong>{quiz.title}</strong>
                                            <span className="quiz-code-badge">{quiz.code}</span>
                                        </div>
                                    </td>
                                    <td>{quiz.duration}</td>
                                    <td>{quiz.questions} Qs</td>
                                    <td>
                                        <span className={`status-badge status-${quiz.status.toLowerCase()}`}>
                                            {quiz.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="performance-cell">
                                            <span>👥 {quiz.enrolled}</span>
                                            <span>⭐ {quiz.avgScore}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only view-btn" title="View Attempts">👁️</button>
                                            <button className="btn-icon-only edit-btn" title="Edit Quiz">✏️</button>
                                            <button className="btn-icon-only delete-btn" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="pagination">
                    <span className="pagination-info">Showing {filteredQuizzes.length} quizzes</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
