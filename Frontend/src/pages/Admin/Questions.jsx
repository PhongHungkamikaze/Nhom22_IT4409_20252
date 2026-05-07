import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Questions() {
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
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Management</h1>
                    <p className="admin-subtitle">View all questions across the platform.</p>
                </div>
            </header>

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
                            <option value="all">All Types</option>
                            <option value="mcq">Multiple Choice</option>
                            <option value="truefalse">True/False</option>
                            <option value="shortanswer">Short Answer</option>
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
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Question</th>
                                <th>Author</th>
                                <th>Quiz</th>
                                <th>Type</th>
                                <th>Choices</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6">Loading questions...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" style={{ color: 'red' }}>Error: {error}</td></tr>
                            ) : filteredQuestions.length > 0 ? (
                                filteredQuestions.map(q => (
                                    <tr key={q.id}>
                                        <td>
                                            <div className="question-text">{q.content}</div>
                                        </td>
                                        <td>{q.author_name || q.author || '-'}</td>
                                        <td>{q.quiz_title || (q.quiz ? `#${q.quiz}` : '-')}</td>
                                        <td>{q.type}</td>
                                        <td>
                                            <ul className="choice-list">
                                                {(q.choices || []).map(c => (
                                                    <li key={c.id} className="choice-item">{c.content}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="action-group">
                                            <Link to={`/admin/questions/${q.id}`} className="text-btn">Detail</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6">No questions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing {filteredQuestions.length} questions</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
