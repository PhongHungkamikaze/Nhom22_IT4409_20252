import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
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

    const recentActivities = [
        { id: 1, user: 'John Doe', action: 'completed Quiz: React Basics', time: '10 mins ago', status: 'passed' },
        { id: 2, user: 'Jane Smith', action: 'registered a new account', time: '1 hour ago', status: 'neutral' },
        { id: 3, user: 'Teacher Bob', action: 'created a new Quiz: Advanced Node.js', time: '2 hours ago', status: 'positive' },
        { id: 4, user: 'Alice Brown', action: 'failed Quiz: CSS Flexbox', time: '3 hours ago', status: 'failed' },
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">Welcome back! Here's an overview of your platform.</p>
                </div>
            </header>

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

                {/* Main Content Area */}
                <div className="dashboard-main">
                    <div className="admin-card recent-activity">
                        <h2 className="card-title">Recent Activities</h2>
                        <ul className="activity-list">
                            {recentActivities.map(activity => (
                                <li key={activity.id} className="activity-item">
                                    <div className={`activity-indicator status-${activity.status}`}></div>
                                    <div className="activity-details">
                                        <p className="activity-text">
                                            <strong>{activity.user}</strong> {activity.action}
                                        </p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className="btn-view-all">View All Activities</button>
                    </div>

                    <QuickSystem />
                </div>
            </div>
        </div>
    );
}
