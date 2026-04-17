import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Student.css';

export default function History() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // READ: Fetch all attempts
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                setLoading(true);
                const data = await apiService.getAttempts();
                const attemptList = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
                setAttempts(attemptList);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch attempts:', err);
                setError('Không thể tải lịch sử làm bài');
                setAttempts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    // Filter attempts
    const filteredAttempts = attempts.filter(attempt => {
        if (filter === 'completed') return attempt.status === 'completed';
        if (filter === 'ongoing') return attempt.status === 'ongoing';
        return true;
    });

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { label: '✓ Hoàn thành', color: '#28a745' };
            case 'processing':
                return { label: '⏳ Đang xử lý', color: '#ffc107' };
            case 'ongoing':
                return { label: '▶️ Đang làm', color: '#007bff' };
            default:
                return { label: status || 'Không xác định', color: '#6c757d' };
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-loading">
                        <div className="stu-spinner"></div>
                        <p>Đang tải lịch sử làm bài...</p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Header */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>📊 Lịch Sử Làm Bài</h1>
                        <p>Xem kết quả của tất cả các bài quiz bạn đã làm</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stu-stats">
                <div className="stu-container">
                    <div className="stu-stats-grid">
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{filteredAttempts.length}</div>
                            <div className="stu-stat-label">
                                {filter === 'all' ? 'Tổng lần làm' : filter === 'completed' ? 'Đã hoàn thành' : 'Đang làm'}
                            </div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {filteredAttempts.length > 0
                                    ? (
                                        (filteredAttempts.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / filteredAttempts.length).toFixed(1)
                                    )
                                    : '0'}
                            </div>
                            <div className="stu-stat-label">Điểm trung bình</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {filteredAttempts.filter(a => a.status === 'completed').length}
                            </div>
                            <div className="stu-stat-label">Đã nộp bài</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter & Content */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    {/* Filter Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {['all', 'completed', 'ongoing'].map(filterOption => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: filter === filterOption ? '#007bff' : '#e0e0e0',
                                    color: filter === filterOption ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: filter === filterOption ? 'bold' : 'normal'
                                }}
                            >
                                {filterOption === 'all' && '📋 Tất cả'}
                                {filterOption === 'completed' && '✓ Đã hoàn thành'}
                                {filterOption === 'ongoing' && '▶️ Đang làm'}
                            </button>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee',
                            color: '#c33',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Attempts Table/List */}
                    {filteredAttempts.length === 0 ? (
                        <div className="stu-empty">
                            <span className="stu-empty-icon">📭</span>
                            <p>
                                {filter === 'all'
                                    ? 'Bạn chưa làm bài quiz nào'
                                    : filter === 'completed'
                                    ? 'Bạn chưa hoàn thành bài quiz nào'
                                    : 'Không có bài quiz đang làm'}
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {/* Mobile-friendly list for smaller screens */}
                            <div style={{ display: 'none' }}>
                                {filteredAttempts.map((attempt, idx) => {
                                    const statusBadge = getStatusBadge(attempt.status);
                                    return (
                                        <div
                                            key={attempt.id}
                                            style={{
                                                padding: '1.5rem',
                                                borderBottom: idx < filteredAttempts.length - 1 ? '1px solid #eee' : 'none',
                                                backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white'
                                            }}
                                        >
                                            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                                {attempt.quiz_title || attempt.quiz}
                                            </div>
                                            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                📅 {formatDate(attempt.started_at)}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: statusBadge.color,
                                                    color: 'white',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {statusBadge.label}
                                                </span>
                                                {attempt.status === 'completed' && (
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
                                                        {attempt.score?.toFixed(1) || 'N/A'} / 10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Table for larger screens */}
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                display: 'block',
                                overflowX: 'auto'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            Bài Quiz
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            Ngày giờ
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            Trạng thái
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            Điểm
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem'
                                        }}>
                                            Chi tiết
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttempts.map((attempt, idx) => {
                                        const statusBadge = getStatusBadge(attempt.status);
                                        return (
                                            <tr
                                                key={attempt.id}
                                                style={{
                                                    borderBottom: '1px solid #eee',
                                                    backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fafafa' : 'white'}
                                            >
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                    {attempt.quiz_title || attempt.quiz}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                                    {formatDate(attempt.started_at)}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    textAlign: 'center'
                                                }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: statusBadge.color,
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        display: 'inline-block'
                                                    }}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    textAlign: 'center',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    color: attempt.status === 'completed' ? '#007bff' : '#999'
                                                }}>
                                                    {attempt.status === 'completed' ? `${(attempt.score || 0).toFixed(1)} / 10` : '-'}
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    textAlign: 'center'
                                                }}>
                                                    {attempt.status === 'completed' ? (
                                                        <Link
                                                            to={`/student/result/${attempt.id}`}
                                                            style={{
                                                                color: '#007bff',
                                                                textDecoration: 'none',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Xem kết quả →
                                                        </Link>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="stu-nav-section">
                <div className="stu-container">
                    <div className="stu-nav-grid">
                        <Link to="/student" className="stu-nav-card">
                            <div className="stu-nav-icon">🏠</div>
                            <h3>Trang chủ</h3>
                            <p>Quay lại trang chủ</p>
                        </Link>
                        <Link to="/student/quizzes" className="stu-nav-card">
                            <div className="stu-nav-icon">📚</div>
                            <h3>Danh sách Quiz</h3>
                            <p>Làm bài quiz mới</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
