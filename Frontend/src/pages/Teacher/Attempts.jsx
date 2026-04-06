import React, { useState } from 'react';
import './Teacher.css';
import '../Admin/Admin.css';
import '../Admin/Users.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function Attempts() {
    const [searchTerm, setSearchTerm] = useState('');

    const [attempts] = useState([
        { id: 101, student: 'Alex Johnson', quiz: 'React Fundamentals', date: 'Oct 26, 2025 10:00 AM', score: '85/100', status: 'Graded' },
        { id: 102, student: 'Mike Ross', quiz: 'React Fundamentals', date: 'Oct 26, 2025 10:15 AM', score: 'Needs Review', status: 'Pending Review' },
        { id: 103, student: 'Jane Smith', quiz: 'CSS Layouts', date: 'Oct 25, 2025 14:00 PM', score: '95/100', status: 'Graded' },
        { id: 104, student: 'Chris Evans', quiz: 'CSS Layouts', date: 'Oct 25, 2025 14:30 PM', score: '42/100', status: 'Graded' },
        { id: 105, student: 'Rachel Zane', quiz: 'Node.js Basics', date: 'Oct 24, 2025 09:00 AM', score: 'Needs Review', status: 'Pending Review' },
    ]);

    const filteredAttempts = attempts.filter(a =>
        a.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.quiz.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Student Attempts</h1>
                    <p className="admin-subtitle">Review and grade submissions from your students.</p>
                </div>
            </header>

            <QuickSystem />

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search student or quiz name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option value="all">All Quizzes</option>
                            <option value="react">React Fundamentals</option>
                            <option value="css">CSS Layouts</option>
                        </select>
                        <select className="filter-select">
                            <option value="all">All Status</option>
                            <option value="graded">Graded</option>
                            <option value="pending">Pending Review</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Quiz Name</th>
                                <th>Date Submitted</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttempts.map(attempt => (
                                <tr key={attempt.id}>
                                    <td>
                                        <div className="user-name-cell">
                                            <div className="avatar" style={{ background: attempt.status === 'Graded' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                {attempt.student.charAt(0)}
                                            </div>
                                            <span>{attempt.student}</span>
                                        </div>
                                    </td>
                                    <td><strong>{attempt.quiz}</strong></td>
                                    <td>{attempt.date}</td>
                                    <td>
                                        <span className={attempt.status === 'Pending Review' ? 'text-warning' : 'text-bold'}>
                                            {attempt.score}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${attempt.status === 'Graded' ? 'active' : 'upcoming'}`}>
                                            {attempt.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={attempt.status === 'Pending Review' ? 'primary-btn' : 'btn-view-all'}>
                                            {attempt.status === 'Pending Review' ? 'Grade Now' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
