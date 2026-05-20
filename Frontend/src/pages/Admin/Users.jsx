import React, { useState, useEffect } from 'react';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [ordering, setOrdering] = useState('id');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ordering: ordering,
            };
            if (roleFilter !== 'all') params.role = roleFilter;
            if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

            const data = await apiService.getUsers(params);
            const list = Array.isArray(data) ? data : (data.results || []);
            setUsers(list);
            setError(null);
        } catch (err) {
            console.error('Failed to load users', err);
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchTerm, roleFilter, statusFilter, ordering]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Quản lý người dùng</h1>
                    <p className="admin-subtitle">Xem, thêm, sửa và xóa người dùng trên hệ thống.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">+</span> Thêm người dùng
                </button>
            </header>

            <div className="admin-card">
                {loading && <p>Loading users...</p>}
                {error && <p className="error-message">Error: {error}</p>}
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">Tất cả vai trò</option>
                            <option value="student">Học sinh</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Bị khóa</option>
                        </select>
                        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                            <option value="id">ID (Tăng dần)</option>
                            <option value="-id">ID (Giảm dần)</option>
                            <option value="username">Tên người dùng A-Z</option>
                            <option value="-username">Tên người dùng Z-A</option>
                            <option value="-date_joined">Mới tham gia</option>
                        </select>
                    </div>
                </div>

                {loading && <p style={{ padding: '20px' }}>Loading users...</p>}
                {error && <p className="error-message" style={{ padding: '20px' }}>Error: {error}</p>}
                
                {!loading && !error && (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-name-cell">
                                                <div className="avatar">{(user.username || '?').charAt(0)}</div>
                                                <span>{user.username}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge role-${(user.role || '').toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="action-group">
                                            <button className="text-btn">Sửa</button>
                                            <button className="text-btn danger" onClick={() => handleDelete(user.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="empty-state">
                                            Không tìm thấy người dùng nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="pagination">
                    <span className="pagination-info">Hiển thị {users.length} người dùng</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
