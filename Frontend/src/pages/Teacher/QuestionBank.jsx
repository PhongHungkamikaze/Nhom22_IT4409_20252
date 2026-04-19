import React, { useState, useEffect } from 'react';
import './Teacher.css';
import apiService from '../../services/api';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Users.css'; // Reuse table styles
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function QuestionBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await apiService.getQuestions();
                if (mounted) setQuestions(data.results || []);
            } catch (err) {
                console.error('Failed to fetch questions', err);
                if (mounted) setError(err.message || 'Fetch failed');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const filteredQuestions = questions.filter(q => {
        const ct = (q.content || '').toString().toLowerCase();
        const qt = (q.quiz_title || '').toString().toLowerCase();
        const s = searchTerm.toLowerCase();
        return ct.includes(s) || qt.includes(s);
    });

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Bank</h1>
                    <p className="admin-subtitle">Organize and manage the repository of your exam questions.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">📝</span> Add Question
                </button>
            </header>

            <QuickSystem />

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search keywords or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option value="all">All Topics</option>
                            <option value="react">React.js</option>
                            <option value="css">CSS</option>
                            <option value="html">HTML</option>
                            <option value="js">JavaScript</option>
                        </select>
                        <select className="filter-select">
                            <option value="all">Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div style={{ padding: 24 }}>Loading questions...</div>
                    ) : error ? (
                        <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div style={{ padding: 24 }}>No questions found.</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Question Prompt</th>
                                    <th>Quiz</th>
                                    <th>Type</th>
                                    <th>Choices</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuestions.map(q => (
                                    <tr key={q.id}>
                                        <td>
                                            <div className="question-text">{q.content}</div>
                                        </td>
                                        <td>{q.quiz_title || (q.quiz ? `#${q.quiz}` : '-')}</td>
                                        <td>{q.type}</td>
                                        <td>
                                            <ul className="choice-list">
                                                {(q.choices || []).map(c => (
                                                    <li key={c.id} className="choice-item">{c.content}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon-only edit-btn" title="Edit Question">✏️</button>
                                                <button className="btn-icon-only delete-btn" title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
