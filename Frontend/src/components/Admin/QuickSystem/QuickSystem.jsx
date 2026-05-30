import React from 'react';
import { Link } from 'react-router-dom';
import './QuickSystem.css';

export default function QuickSystem() {
    return (
        <div className="admin-card quick-actions">
            <h2 className="card-title">Quản lý Hệ thống</h2>
            <div className="actions-grid">
                <Link to="/admin/users" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">👥</span>
                    User Management
                </Link>
                <Link to="/admin/quizzes" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📚</span>
                    Quiz Management
                </Link>
                <Link to="/admin/questions" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📝</span>
                    Question Bank
                </Link>
                <Link to="/admin/attempts" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📊</span>
                    View Attempts
                </Link>
                <Link to="/admin/notifications" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">🔔</span>
                    Notifications
                </Link>
                <Link to="/admin/subjects" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📖</span>
                    Subject Management
                </Link>
                <Link to="/admin/class-groups" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">👥</span>
                    Class Groups
                </Link>
                <Link to="/admin/files" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📄</span>
                    File Management
                </Link>
            </div>
        </div>
    );
}
