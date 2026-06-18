import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Dashboard() {
    // Mock data for dashboard
    const stats = [
        { title: 'Total Quizzes', value: 124, icon: '📚', color: 'blue' },
        { title: 'Total Users', value: '2.5k', icon: '👥', color: 'green' },
        { title: 'Daily Attempts', value: 342, icon: '✍️', color: 'purple' },
        { title: 'Pass Rate', value: '68%', icon: '📈', color: 'orange' },
    ];


    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">Welcome back! Here's an overview of your platform.</p>
                </div>
            </header>
            <QuickSystem />
            <div className="dashboard-grid">
                {/* Stats Section */}
                <div className="stats-container">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`stat-card stat-${stat.color}`}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-info">
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
