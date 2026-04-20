import React, { useState } from 'react';
import './Users.css';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';
export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');

    const [users] = useState([
        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Student', status: 'Active', joined: '2025-01-12' },
        { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', role: 'Teacher', status: 'Active', joined: '2024-11-05' },
        { id: 3, name: 'Mike Ross', email: 'mike@example.com', role: 'Student', status: 'Inactive', joined: '2025-02-28' },
        { id: 4, name: 'Rachel Zane', email: 'rachel@example.com', role: 'Admin', status: 'Active', joined: '2023-09-15' },
        { id: 5, name: 'Harvey Specter', email: 'harvey@example.com', role: 'Teacher', status: 'Active', joined: '2024-03-22' },
    ]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <select className="filter-select">
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select className="filter-select">
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
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-name-cell">
                                            <div className="avatar">{user.name.charAt(0)}</div>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{user.joined}</td>
                                    <td className="action-group">
                                        <button className="text-btn">Edit</button>
                                        <button className="text-btn danger">Delete</button>
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
            </div>
        </div>
    );
}
