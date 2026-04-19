import React, { useState, useEffect } from 'react';
import './Teacher.css';
import '../Admin/Admin.css';
import '../Admin/Users.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function Attempts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await apiService.getAttempts();
                if (mounted) setAttempts(data.results || []);
            } catch (err) {
                console.error('Failed to fetch attempts', err);
                if (mounted) setError(err.message || 'Fetch failed');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const filteredAttempts = attempts.filter(a => {
        const username = (a.username || '').toString().toLowerCase();
        const quizTitle = (a.quiz_title || '').toString().toLowerCase();
        const s = searchTerm.toLowerCase();
        return username.includes(s) || quizTitle.includes(s);
    });

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
                    {loading ? (
                        <div style={{ padding: 24 }}>Loading attempts...</div>
                    ) : error ? (
                        <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>
                    ) : filteredAttempts.length === 0 ? (
                        <div style={{ padding: 24 }}>No attempts found.</div>
                    ) : (
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
                                {filteredAttempts.map((attempt, idx) => (
                                    <React.Fragment key={`${attempt.user}-${attempt.quiz}-${idx}`}>
                                        <tr>
                                            <td>
                                                <div className="user-name-cell">
                                                    <div className="avatar" style={{ background: attempt.status === 'graded' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                        {(attempt.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{attempt.username || `user${attempt.user}`}</span>
                                                </div>
                                            </td>
                                            <td><strong>{attempt.quiz_title || `#${attempt.quiz}`}</strong></td>
                                            <td>{attempt.started_at}</td>
                                            <td>
                                                <span className={attempt.status && attempt.status.toLowerCase() === 'ready' ? 'text-warning' : 'text-bold'}>
                                                    {attempt.score}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${attempt.status && attempt.status.toLowerCase() === 'graded' ? 'active' : 'upcoming'}`}>
                                                    {attempt.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className={attempt.status && attempt.status.toLowerCase() === 'ready' ? 'primary-btn' : 'btn-view-all'}
                                                        onClick={() => { /* navigate to grading page */ }}>
                                                        {attempt.status && attempt.status.toLowerCase() === 'ready' ? 'Grade Now' : 'View Details'}
                                                    </button>
                                                    <button className="btn-icon-only" onClick={() => setExpanded(expanded === idx ? null : idx)} title="Toggle answers">🔽</button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded === idx && (
                                            <tr>
                                                <td colSpan={6} style={{ background: '#fafafa' }}>
                                                    <div style={{ padding: 12 }}>
                                                        <h4>Answers</h4>
                                                        {attempt.answers && attempt.answers.length > 0 ? (
                                                            <ul className="answer-list">
                                                                {attempt.answers.map((ans, i) => (
                                                                    <li key={i} className="answer-item">
                                                                        <div><strong>Q:</strong> {ans.question_content}</div>
                                                                        <div><strong>Selected:</strong> {(ans.selected_choices || []).join(', ') || '—'}</div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div>No answers submitted.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
