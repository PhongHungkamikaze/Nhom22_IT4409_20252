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
                return { label: 'Hoàn thành', className: 'is-completed' };
            case 'processing':
                return { label: 'Đang xử lý', className: 'is-processing' };
            case 'ongoing':
                return { label: 'Đang làm', className: 'is-ongoing' };
            default:
                return { label: status || 'Không xác định', className: 'is-unknown' };
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
                        <h1>Lịch sử làm bài</h1>
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
                    <div className="stu-history-filters">
                        {['all', 'completed', 'ongoing'].map(filterOption => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`stu-filter-btn${filter === filterOption ? ' active' : ''}`}
                            >
                                {filterOption === 'all' && 'Tất cả'}
                                {filterOption === 'completed' && 'Đã hoàn thành'}
                                {filterOption === 'ongoing' && 'Đang làm'}
                            </button>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="stu-alert stu-alert-error">
                            {error}
                        </div>
                    )}

                    {/* Attempts Table/List */}
                    {filteredAttempts.length === 0 ? (
                        <div className="stu-empty">
                            <p>
                                {filter === 'all'
                                    ? 'Bạn chưa làm bài quiz nào'
                                    : filter === 'completed'
                                        ? 'Bạn chưa hoàn thành bài quiz nào'
                                        : 'Không có bài quiz đang làm'}
                            </p>
                        </div>
                    ) : (
                        <div className="stu-card stu-history-card">
                            {/* Mobile-friendly list for smaller screens */}
                            <div className="stu-history-list">
                                {filteredAttempts.map((attempt, idx) => {
                                    const statusBadge = getStatusBadge(attempt.status);
                                    return (
                                        <div
                                            key={attempt.id}
                                            className={`stu-history-item${idx < filteredAttempts.length - 1 ? ' has-divider' : ''}`}
                                        >
                                            <div className="stu-history-title">
                                                {attempt.quiz_title || attempt.quiz}
                                            </div>
                                            <div className="stu-history-time">
                                                {formatDate(attempt.started_at)}
                                            </div>
                                            <div className="stu-history-row">
                                                <span className={`stu-status-badge ${statusBadge.className}`}>
                                                    {statusBadge.label}
                                                </span>
                                                {attempt.status === 'completed' && (
                                                    <span className="stu-history-score">
                                                        {attempt.score?.toFixed(1) || 'N/A'} / 10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Table for larger screens */}
                            <div className="stu-history-table-wrap">
                                <table className="stu-history-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Bài Quiz
                                            </th>
                                            <th>
                                                Ngày giờ
                                            </th>
                                            <th className="is-center">
                                                Trạng thái
                                            </th>
                                            <th className="is-center">
                                                Điểm
                                            </th>
                                            <th className="is-center">
                                                Chi tiết
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttempts.map((attempt, idx) => {
                                            const statusBadge = getStatusBadge(attempt.status);
                                            return (
                                                <tr key={attempt.id} className={idx % 2 === 0 ? 'is-even' : 'is-odd'}>
                                                    <td className="is-strong">
                                                        {attempt.quiz_title || attempt.quiz}
                                                    </td>
                                                    <td className="is-muted">
                                                        {formatDate(attempt.started_at)}
                                                    </td>
                                                    <td className="is-center">
                                                        <span className={`stu-status-badge ${statusBadge.className}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="is-center">
                                                        <span className={attempt.status === 'completed' ? 'stu-score' : 'stu-score is-muted'}>
                                                            {attempt.status === 'completed' ? `${(attempt.score || 0).toFixed(1)} / 10` : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="is-center">
                                                        {attempt.status === 'completed' ? (
                                                            <Link
                                                                to={`/student/result/${attempt.id}`}
                                                                className="stu-history-link"
                                                            >
                                                                Xem kết quả
                                                            </Link>
                                                        ) : (
                                                            <span className="is-muted">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="stu-nav-section">
                <div className="stu-container">
                    <div className="stu-nav-grid">
                        <Link to="/student" className="stu-nav-card">
                            <h3>Trang chủ</h3>
                            <p>Quay lại trang chủ</p>
                        </Link>
                        <Link to="/student/quizzes" className="stu-nav-card">
                            <h3>Danh sách Quiz</h3>
                            <p>Làm bài quiz mới</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
