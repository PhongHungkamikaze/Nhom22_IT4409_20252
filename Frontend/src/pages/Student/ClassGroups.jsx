import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';

export default function StudentClassGroups() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const data = await apiService.getClassGroups();
                const list = data.results || (Array.isArray(data) ? data : []);
                const enriched = await Promise.all(
                    list.map(async (g) => {
                        try {
                            const qs = await apiService.getAssignedQuizzes(g.id);
                            return { ...g, quizzes: Array.isArray(qs) ? qs : [] };
                        } catch {
                            return { ...g, quizzes: [] };
                        }
                    })
                );
                setGroups(enriched);
                setError(null);
            } catch (err) {
                setError('Không thể tải danh sách lớp học.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="student-page">
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <span className="stu-badge-icon">📚</span>
                                Lớp học của tôi
                            </div>
                            <h1 className="stu-header-title">Lớp học & Nhóm</h1>
                            <p className="stu-header-subtitle">
                                Danh sách các lớp học bạn đã tham gia và bài quiz được gán.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stu-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {loading && (
                    <div className="stu-loading">
                        <div className="stu-spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                )}

                {error && <div className="stu-alert stu-alert-error">{error}</div>}

                {!loading && groups.length === 0 && (
                    <div className="stu-empty">
                        <div className="stu-empty-icon-wrap">
                            <span className="stu-empty-icon">📚</span>
                        </div>
                        <p>Bạn chưa tham gia lớp học nào.</p>
                    </div>
                )}

                {!loading && groups.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {groups.map((group) => (
                            <div key={group.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    padding: '1.5rem 1.5rem 1rem',
                                    borderBottom: group.quizzes.length > 0 ? '1px solid #e5e7eb' : 'none',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.3rem' }}>{group.name}</h2>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                                                {group.description || 'Không có mô tả'}
                                            </p>
                                        </div>
                                        <div className="stu-quiz-info" style={{ flexShrink: 0 }}>
                                            <span>👥 {group.member_count} thành viên</span>
                                            {group.created_by && <span>👨‍🏫 {group.created_by}</span>}
                                        </div>
                                    </div>
                                </div>

                                {group.quizzes.length > 0 && (
                                    <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.95rem', fontWeight: 700 }}>
                                            📝 Bài quiz được gán
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {group.quizzes.map((aq) => (
                                                <div
                                                    key={aq.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1rem 1.25rem',
                                                        background: '#f9fafb',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e5e7eb',
                                                        gap: '1rem',
                                                    }}
                                                >
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                                                            {aq.quiz_title}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#6b7280' }}>
                                                            <span>👨‍🏫 {aq.assigned_by_username}</span>
                                                            {aq.due_date && (
                                                                <span>📅 Hạn: {new Date(aq.due_date).toLocaleDateString('vi-VN')}</span>
                                                            )}
                                                            <span>📅 Gán: {new Date(aq.created_at).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="stu-quiz-start-btn"
                                                        style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                                                        onClick={() => navigate(`/student/quizzes/${aq.quiz}`)}
                                                    >
                                                        Làm bài
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {group.quizzes.length === 0 && (
                                    <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                                        <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                            Chưa có quiz nào được gán cho lớp này.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
