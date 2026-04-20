import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './Attempts.css';
import './Admin.css';
import './Users.css';
import './Quizzes.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Attempts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiService.getAttempts();
                setAttempts(Array.isArray(data.results) ? data.results : data);
            } catch (err) {
                console.error('Failed to fetch attempts', err);
                setError(err.message || 'Fetch failed');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredAttempts = attempts.filter(a => {
        const username = (a.user?.username || a.username || '').toString().toLowerCase();
        const quizTitle = (a.quiz?.title || a.quiz_title || '').toString().toLowerCase();
        const s = searchTerm.toLowerCase();
        return username.includes(s) || quizTitle.includes(s);
    });

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">All Attempts</h1>
                    <p className="admin-subtitle">Monitor and review all student submissions across the platform.</p>
                </div>
            </header>

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
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Quiz</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7">Loading attempts...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="7" style={{ color: 'red' }}>Error: {error}</td></tr>
                            ) : filteredAttempts.length > 0 ? (
                                filteredAttempts.map(attempt => (
                                    <tr key={attempt.id}>
                                        <td>{attempt.id}</td>
                                        <td>
                                            <div className="user-name-cell">
                                                <div className="avatar">
                                                    {(attempt.user?.username || attempt.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span>{attempt.user?.username || attempt.username}</span>
                                            </div>
                                        </td>
                                        <td><strong>{attempt.quiz?.title || attempt.quiz_title || `#${attempt.quiz}`}</strong></td>
                                        <td>{attempt.score ?? '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${(attempt.status || 'pending').toLowerCase()}`}>
                                                {attempt.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td>{attempt.started_at || attempt.created_at || '-'}</td>
                                        <td className="action-group">
                                            <button className="text-btn">View</button>
                                            <button className="text-btn">Grade</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7">No attempts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing {filteredAttempts.length} attempts</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
