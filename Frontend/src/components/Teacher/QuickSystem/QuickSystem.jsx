import React from 'react';
import { Link } from 'react-router-dom';
import './QuickSystem.css';

export default function QuickSystem() {
    return (
        <div className="teacher-quick-actions admin-card">
            <h2 className="card-title">Quản lý Hệ thống</h2>
            <div className="actions-grid">
                <Link to="/teacher/quizzes" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📚</span>
                    Quản lý Quiz
                </Link>
                <Link to="/teacher/questions" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📝</span>
                    Ngân hàng Câu hỏi
                </Link>
                <Link to="/teacher/attempts" className="action-btn" style={{ textDecoration: 'none' }}>
                    <span className="action-icon">📊</span>
                    Xem Attempts
                </Link>
            </div>
        </div>
    );
}
