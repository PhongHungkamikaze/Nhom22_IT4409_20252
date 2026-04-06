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
            </div>
        </div>
    );
}
