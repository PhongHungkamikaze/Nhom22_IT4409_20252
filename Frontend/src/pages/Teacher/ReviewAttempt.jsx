import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Teacher.css';

const ReviewAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const data = await apiService.getAttempt(attemptId);
        setAttempt(data);
      } catch (err) {
        setError('Failed to load attempt');
        console.error('Error loading attempt:', err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId]);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="review-attempt-container">
      <h1>Xem lại bài làm</h1>
      {attempt && (
        <div className="attempt-details">
          <h2>{attempt.quiz?.title}</h2>
          <p>Học sinh: {attempt.user?.username}</p>
          <p>Điểm: {attempt.score}/{attempt.total_points}</p>
          <p>Trạng thái: {attempt.status}</p>
          
          <button onClick={() => navigate(-1)} className="back-btn">
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewAttempt;

