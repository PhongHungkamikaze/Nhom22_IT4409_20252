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

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await apiService.getUsers();
                // support both paginated ({results: []}) and plain list
                const list = Array.isArray(data) ? data : (data.results || []);
                const transformed = list.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email || '',
                    role: u.role,
                }));
                if (mounted) setUsers(transformed);
            } catch (err) {
                console.error('Failed to load users', err);
                if (mounted) setError(err.message || 'Failed to fetch users');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const filteredUsers = users.filter(user => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = user.username.toLowerCase().includes(q);
        const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesRole && matchesStatus;
    });

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
                    <h1 className="admin-title">User Management</h1>
                    <p className="admin-subtitle">View, add, edit, and remove users across the platform.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">+</span> Add New User
                </button>
            </header>

            <div className="admin-card">
                {loading && <p>Loading users...</p>}
                {error && <p className="error-message">Error: {error}</p>}
                {!loading && !error && (
                    <>
                        <div className="table-controls">
                            <div className="search-bar">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="all">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-name-cell">
                                                    <div className="avatar">{user.username.charAt(0)}</div>
                                                    <span>{user.username}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="action-group">
                                                <button className="text-btn">Edit</button>
                                                <button className="text-btn danger" onClick={() => handleDelete(user.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            <span className="pagination-info">Showing {filteredUsers.length} of {users.length} users</span>
                            <div className="pagination-controls">
                                <button className="page-btn active">1</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
