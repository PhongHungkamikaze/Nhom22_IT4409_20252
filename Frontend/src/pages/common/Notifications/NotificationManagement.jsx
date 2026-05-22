import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import '../../Admin/Admin.css';
import './NotificationManagement.css';
import QuickSystem from '../../../components/Admin/QuickSystem/QuickSystem';
import TeacherQuickSystem from '../../../components/Teacher/QuickSystem/QuickSystem';
import StudentQuickSystem from '../../../components/Student/QuickSystem/QuickSystem';

const NotificationManagement = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                page_size: 15,
            };
            if (filter === 'unread') params.is_read = false;
            if (filter === 'read') params.is_read = true;
            if (searchTerm) params.search = searchTerm;

            const data = await apiService.getNotifications(params);
            setNotifications(data.results || []);
            setTotalPages(Math.ceil(data.count / 15) || 1);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchNotifications();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, filter, searchTerm]);

    const handleToggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n.id));
        }
    };

    const handleMarkAsRead = async () => {
        if (selectedIds.length === 0) return;
        try {
            await apiService.markNotificationsRead(selectedIds);
            setNotifications(prev => prev.map(n =>
                selectedIds.includes(n.id) ? { ...n, is_read: true } : n
            ));
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thông báo đã chọn?`)) return;
        try {
            await apiService.markNotificationsDeleted(selectedIds);
            setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'EXAM_VIOLATION': return 'Vi phạm';
            case 'QUIZ_PUBLISHED': return 'Xuất bản';
            case 'SYSTEM_ALERT': return 'Hệ thống';
            default: return type || 'Khác';
        }
    };

    const containerClass = role === 'student' ? 'student-page' : 'admin-container';
    const titleText = role === 'admin'
        ? 'Quản lý Thông báo (Admin)'
        : role === 'teacher'
            ? 'Quản lý Thông báo (Giáo viên)'
            : 'Thông báo của bạn';

    return (
        <div className={`${containerClass} notifications-page`}>
            {role === 'admin' ? <QuickSystem /> : role === 'teacher' ? <TeacherQuickSystem /> : <StudentQuickSystem />}
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">{titleText}</h1>
                    <p className="admin-subtitle">Xem và quản lý lịch sử thông báo hệ thống.</p>
                </div>
                <div className="notifications-actions">
                    {selectedIds.length > 0 && (
                        <>
                            <button className="primary-btn" onClick={handleMarkAsRead}>
                                Đánh dấu đã đọc ({selectedIds.length})
                            </button>
                            <button className="primary-btn danger" onClick={handleDelete}>
                                Xóa ({selectedIds.length})
                            </button>
                        </>
                    )}
                    <button className="primary-btn secondary" onClick={fetchNotifications}>
                        Làm mới
                    </button>
                </div>
            </header>

            <div className="admin-card">
                <div className="table-controls notifications-toolbar">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
                            <option value="all">Tất cả</option>
                            <option value="unread">Chưa đọc</option>
                            <option value="read">Đã đọc</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === notifications.length && notifications.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Loại</th>
                                <th>Tiêu đề</th>
                                <th>Nội dung</th>
                                <th>Người nhận</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7">Đang tải thông báo...</td></tr>
                            ) : notifications.length > 0 ? (
                                notifications.map(n => (
                                    <tr key={n.id} style={{ background: !n.is_read ? '#f0f7ff' : 'transparent' }}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(n.id)}
                                                onChange={() => handleToggleSelect(n.id)}
                                            />
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${(n.type || '').toLowerCase()}`}>
                                                {getTypeLabel(n.type)}
                                            </span>
                                        </td>
                                        <td className="notification-title"><strong>{n.title}</strong></td>
                                        <td className="notification-content">{n.content}</td>
                                        <td>{n.recipient_name || `User #${n.recipient}`}</td>
                                        <td>{formatDate(n.created_at)}</td>
                                        <td>
                                            <span className={`role-badge ${n.is_read ? 'role-student' : 'role-admin'}`}>
                                                {n.is_read ? 'Đã đọc' : 'Mới'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7">Không có thông báo nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Trang {page} / {totalPages}</span>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Trước
                        </button>
                        <button className="page-btn active">{page}</button>
                        <button
                            className="page-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationManagement;
