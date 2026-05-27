import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Admin.css';

export default function AdminQuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuestion(id);
                setQuestion(data);
            } catch (err) {
                console.error('Failed to load question', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error) return <div className="admin-container"><div className="admin-card" style={{ color: '#b91c1c' }}>Error: {error}</div></div>;
    if (!question) return <div className="admin-container"><div className="admin-card">Question not found</div></div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Detail</h1>
                    <p className="admin-subtitle">Viewing question #{question.id}</p>
                </div>
                <button className="secondary-btn" onClick={() => navigate('/admin/questions')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    ← Back to Questions
                </button>
            </header>

            <div className="admin-card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Type</strong>
                        <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{question.type}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Subject</strong>
                        <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{question.subject_name || '-'}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Author</strong>
                        <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>{question.author_name || question.author || '-'}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Question ID</strong>
                        <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>#{question.id}</div>
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 8, color: '#0f172a' }}>Question Content</h3>
                    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.7, color: '#334155' }}>{question.content}</p>
                    </div>
                </div>

                {Array.isArray(question.choices) && question.choices.length > 0 && (
                    <div>
                        <h3 style={{ marginBottom: 12, color: '#0f172a' }}>Choices ({question.choices.length})</h3>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }}>#</th>
                                        <th>Content</th>
                                        <th style={{ width: 120 }}>Correct?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {question.choices.map((c, idx) => (
                                        <tr key={c.id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>{c.content}</td>
                                            <td>
                                                {c.is_correct ? (
                                                    <span className="status-badge status-active">✓ Correct</span>
                                                ) : (
                                                    <span className="status-badge status-inactive">✗ Wrong</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {Array.isArray(question.choices) && question.choices.length === 0 && (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No choices for this question.</p>
                )}
            </div>
        </div>
    );
}
