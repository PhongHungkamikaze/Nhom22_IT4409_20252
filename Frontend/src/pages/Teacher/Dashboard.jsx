import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Teacher.css';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Dashboard.css'; // Reuse common dashboard styles
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function Dashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await apiService.getQuizzes();
                console.log("Fetched quizzes:", data); // Debug log
                // If API returns an array, use it; otherwise handle accordingly
                setQuizzes(Array.isArray(data.results) ? data.results.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch quizzes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const stats = [
        { title: 'My Quizzes', value: 8, icon: '📝', color: 'blue' },
        { title: 'Enrolled Students', value: 145, icon: '👨‍🎓', color: 'green' },
        { title: 'Total Attempts', value: 632, icon: '🎯', color: 'purple' },
        { title: 'Avg. Score', value: '76%', icon: '⭐', color: 'orange' },
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Teacher Dashboard</h1>
                    <p className="admin-subtitle">Manage your quizzes and track student progress.</p>
                </div>
            </header>
            <QuickSystem />
            <div className="dashboard-grid">
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

                <div className="dashboard-main">

                </div>
            </div>
        </div>
    );
}
