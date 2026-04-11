import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './QuickSystem.css';

export default function QuickSystem() {
    const location = useLocation();
    const navItems = [
        { to: '/student', icon: '🏠', label: 'Trang chính', exact: true },
        { to: '/student/quizzes', icon: '📚', label: 'Danh sách Quiz' },
        { to: '/student/history', icon: '📊', label: 'Lịch sử làm bài' },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.to;
        return location.pathname.startsWith(item.to);
    };

    return (
        <div className="student-quick-actions admin-card">
            <div className="actions-grid">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`action-btn${isActive(item) ? ' active' : ''}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <span className="action-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
