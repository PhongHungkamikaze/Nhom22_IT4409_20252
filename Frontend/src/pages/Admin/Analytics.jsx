import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Admin.css';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load analytics');
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="analytics-container">
      <h1>Phân tích thống kê</h1>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng bài quiz</h3>
            <p className="stat-value">{stats.total_quizzes || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Tổng người dùng</h3>
            <p className="stat-value">{stats.total_users || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Bài thi hoàn thành</h3>
            <p className="stat-value">{stats.completed_attempts || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

