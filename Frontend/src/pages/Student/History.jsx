import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiBookOpen,
    FiActivity,
    FiAward,
    FiCheckCircle,
    FiClock,
    FiEye,
    FiCalendar,
    FiFileText
} from 'react-icons/fi';
import './Student.css';

export default function History() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState('-started_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchAttempts = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                ordering: sorting,
                page: page,
                page_size: pageSize
            };
            const data = await apiService.getAttempts(params);
            if (data.results) {
                setAttempts(data.results);
                setTotalCount(data.count);
            } else {
                setAttempts(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch attempts:', err);
            setError('Không thể tải lịch sử làm bài');
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    // READ: Fetch all attempts
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchAttempts(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, sorting]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchAttempts(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = (totalCount > currentPage * pageSize) || (attempts.length === pageSize);

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

    // Score styling class helper
    const getScoreClass = (score) => {
        const numScore = parseFloat(score);
        if (isNaN(numScore)) return 'stu-score-low';
        if (numScore >= 8.0) return 'stu-score-high';
        if (numScore >= 5.0) return 'stu-score-medium';
        return 'stu-score-low';
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
                <section className="stu-loading">
                    <div className="stu-spinner"></div>
                    <p>Đang tải lịch sử làm bài của bạn...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Header Hero Banner */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiActivity className="stu-badge-icon" />
                                Lịch Sử Hoạt Động
                            </div>
                            <h1>Lịch sử làm bài của bạn</h1>
                            <p>Xem lại tất cả kết quả, điểm số và chi tiết các bài kiểm tra trắc nghiệm bạn đã từng làm.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard Row */}
            <section className="stu-stats" style={{ padding: '2rem 0' }}>
                <div className="stu-container">
                    <div className="stu-stats-grid">
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{filteredAttempts.length}</div>
                            <div className="stu-stat-label">
                                {filter === 'all' ? 'Tổng số lượt làm' : filter === 'completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                            </div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {attempts.filter(a => a.status === 'completed').length > 0
                                    ? (
                                        (attempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / attempts.filter(a => a.status === 'completed').length).toFixed(1)
                                    )
                                    : '0.0'}
                            </div>
                            <div className="stu-stat-label">Điểm trung bình tích lũy</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {attempts.filter(a => a.status === 'completed' && parseFloat(a.score) >= 5.0).length}
                            </div>
                            <div className="stu-stat-label">Bài đạt yêu cầu (&gt;= 5.0)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter & Content Section */}
            <section className="stu-quizzes-section" style={{ paddingTop: '1.5rem' }}>
                <div className="stu-container">

                    {/* Segmented Controls Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <div className="stu-history-filters-premium">
                            {['all', 'completed', 'ongoing'].map(filterOption => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`stu-filter-btn-premium${filter === filterOption ? ' active' : ''}`}
                                >
                                    {filterOption === 'all' && 'Tất cả lượt làm'}
                                    {filterOption === 'completed' && 'Đã hoàn thành'}
                                    {filterOption === 'ongoing' && 'Đang làm dở'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="stu-alert stu-alert-error">
                            {error}
                        </div>
                    )}

                    {/* Attempts Table/List Card */}
                    {filteredAttempts.length === 0 ? (
                        <div className="stu-empty" style={{ background: '#ffffff', borderRadius: '20px', padding: '4rem 2rem', border: '1px solid #eef2f6' }}>
                            <div className="stu-empty-icon-wrap">
                                <FiFileText size={40} className="stu-empty-icon" />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                                {filter === 'all'
                                    ? 'Bạn chưa từng tham gia làm bài quiz nào.'
                                    : filter === 'completed'
                                        ? 'Không có bài quiz nào ở trạng thái đã hoàn thành.'
                                        : 'Không có bài quiz nào đang thực hiện dở.'}
                            </p>
                            <Link to="/student/quizzes" className="stu-quiz-start-btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                                Bắt đầu làm Quiz ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="stu-history-card-premium">

                            {/* Mobile-friendly list for smaller screens */}
                            <div className="stu-history-list-mobile">
                                {filteredAttempts.map((attempt) => {
                                    const statusBadge = getStatusBadge(attempt.status);
                                    return (
                                        <div key={attempt.id} className="stu-history-item-mobile">
                                            <div className="stu-history-item-mobile-header">
                                                <div className="stu-history-item-mobile-title">
                                                    {attempt.quiz_title || attempt.quiz}
                                                </div>
                                                <span className={`stu-status-badge ${statusBadge.className}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            <div className="stu-history-item-mobile-meta">
                                                <FiCalendar style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {formatDate(attempt.started_at)}
                                            </div>
                                            <div className="stu-history-item-mobile-footer">
                                                <div>
                                                    {attempt.status === 'completed' && (
                                                        <span className={`stu-score-premium ${getScoreClass(attempt.score)}`}>
                                                            {attempt.score?.toFixed(1) || '0.0'} / 10
                                                        </span>
                                                    )}
                                                </div>
                                                {attempt.status === 'completed' ? (
                                                    <Link to={`/student/result/${attempt.id}`} className="stu-history-btn-detail">
                                                        <FiEye /> Kết quả
                                                    </Link>
                                                ) : (
                                                    <span className="is-muted" style={{ fontSize: '0.9rem' }}>Chưa nộp bài</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Table for larger screens */}
                            <div className="stu-history-table-wrap">
                                <table className="stu-history-table-premium">
                                    <thead>
                                        <tr>
                                            <th>Bài Kiểm Tra</th>
                                            <th>Thời Gian Bắt Đầu</th>
                                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                                            <th style={{ textAlign: 'center' }}>Điểm Số</th>
                                            <th style={{ textAlign: 'center' }}>Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttempts.map((attempt) => {
                                            const statusBadge = getStatusBadge(attempt.status);
                                            return (
                                                <tr key={attempt.id}>
                                                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {attempt.quiz_title || attempt.quiz}
                                                    </td>
                                                    <td style={{ color: '#64748b' }}>
                                                        {formatDate(attempt.started_at)}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`stu-status-badge ${statusBadge.className}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {attempt.status === 'completed' ? (
                                                            <span className={`stu-score-premium ${getScoreClass(attempt.score)}`}>
                                                                {attempt.score !== undefined ? (Number(attempt.score).toFixed(1)) : '0.0'} / 10
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>-</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {attempt.status === 'completed' ? (
                                                            <Link
                                                                to={`/student/result/${attempt.id}`}
                                                                className="stu-history-btn-detail"
                                                            >
                                                                <FiEye /> Xem kết quả
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                to={`/student/quizzes/${attempt.quiz}/take`}
                                                                className="stu-history-btn-detail"
                                                                style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                                                            >
                                                                <FiClock /> Làm tiếp
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalCount > 0 && (
                                <div className="pagination" style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                                    <span className="pagination-info">Hiển thị {attempts.length} trên tổng số {totalCount} lượt làm bài</span>
                                    <div className="pagination-controls">
                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </button>

                                        {Array.from({ length: totalPages }).map((_, index) => {
                                            const pageNum = index + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!hasNextPage}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Navigation Footer */}
            <section className="stu-nav-section">
                <div className="stu-container">
                    <div className="stu-nav-grid">
                        <Link to="/student" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiHome className="stu-nav-icon" />
                            </div>
                            <h3>Trang chủ</h3>
                            <p>Quay lại bảng điều khiển</p>
                        </Link>
                        <Link to="/student/quizzes" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiBookOpen className="stu-nav-icon" />
                            </div>
                            <h3>Danh sách Quiz</h3>
                            <p>Luyện tập làm bài thi mới</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
