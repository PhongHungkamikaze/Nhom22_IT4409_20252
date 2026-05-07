import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Admin.css';

export default function AdminQuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuiz(id);
                setQuiz(data);
            } catch (err) {
                console.error('Failed to load quiz', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error) return <div className="admin-container"><div className="admin-card" style={{ color: '#b91c1c' }}>Error: {error}</div></div>;
    if (!quiz) return <div className="admin-container"><div className="admin-card">Quiz not found</div></div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Quiz Detail</h1>
                    <p className="admin-subtitle">Viewing quiz #{quiz.id}</p>
                </div>
                <button className="secondary-btn" onClick={() => navigate('/admin/quizzes')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    ← Back to Quizzes
                </button>
            </header>

            <div className="admin-card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div>
                        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: '#0f172a' }}>{quiz.title}</h2>
                        <p style={{ color: '#475569', lineHeight: 1.6 }}>{quiz.description || 'No description provided.'}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Author</strong>
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{quiz.author_name || '-'}</div>
                        </div>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Subject</strong>
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{quiz.subject_name || '-'}</div>
                        </div>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Time Limit</strong>
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{quiz.time_limit ? `${quiz.time_limit} min` : '—'}</div>
                        </div>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Published</strong>
                            <div style={{ marginTop: 6 }}>
                                {quiz.is_published ? (
                                    <span className="status-badge status-active">Đã xuất bản</span>
                                ) : (
                                    <span className="status-badge status-pending">Chưa xuất bản</span>
                                )}
                            </div>
                        </div>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Max Attempts</strong>
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{quiz.max_attempts ?? '-'}</div>
                        </div>
                        <div className="meta-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Created At</strong>
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{quiz.created_at ? new Date(quiz.created_at).toLocaleString() : '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Questions list */}
                {Array.isArray(quiz.questions) && quiz.questions.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <h3 style={{ marginBottom: 12, color: '#0f172a' }}>Questions ({quiz.questions.length})</h3>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }}>#</th>
                                        <th>Question</th>
                                        <th>Type</th>
                                        <th>Choices</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quiz.questions.map((q, idx) => (
                                        <tr key={q.id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>{q.content}</td>
                                            <td>{q.type}</td>
                                            <td>
                                                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: '0.9rem' }}>
                                                    {(q.choices || []).map(c => (
                                                        <li key={c.id} style={{ padding: '2px 0' }}>
                                                            {c.content}
                                                            {c.is_correct && <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 8 }}>✓</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {Array.isArray(quiz.questions) && quiz.questions.length === 0 && (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No questions in this quiz.</p>
                )}
            </div>
        </div>
    );
}
