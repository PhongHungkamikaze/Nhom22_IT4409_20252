import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Teacher.css';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    time_limit: 60,
    pass_score: 70,
    is_published: false
  });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizData, subjectsData] = await Promise.all([
        apiService.getQuiz(id),
        apiService.getSubjects()
      ]);
      
      setQuiz(quizData);
      setFormData({
        title: quizData.title || '',
        description: quizData.description || '',
        subject: quizData.subject || '',
        time_limit: quizData.time_limit || 60,
        pass_score: quizData.pass_score || 70,
        is_published: quizData.is_published || false
      });
      
      setSubjects(Array.isArray(subjectsData) ? subjectsData : (subjectsData.results || []));
    } catch (err) {
      setError('Không thể tải thông tin bài quiz');
      console.error('Error loading quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.updateQuiz(id, formData);
      toast.success('Cập nhật bài thi thành công!');
      navigate('/teacher/quizzes');
    } catch (err) {
      const msg = err.message || 'Lỗi khi cập nhật bài thi';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!quiz && loading) return <div className="teacher-container"><p>Đang tải...</p></div>;

  return (
    <div className="quiz-edit-container" style={{ padding: '20px' }}>
      <h1>Chỉnh sửa bài quiz</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Tiêu đề *</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Môn học</label>
          <select name="subject" value={formData.subject} onChange={handleChange}>
            <option value="">Chọn môn học</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Thời gian làm bài (phút)</label>
          <input 
            type="number" 
            name="time_limit"
            value={formData.time_limit}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Điểm đạt (%)</label>
          <input 
            type="number" 
            name="pass_score"
            value={formData.pass_score}
            onChange={handleChange}
            min="0"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
            />
            <span> Xuất bản bài quiz</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        <button type="button" className="secondary-btn" onClick={() => navigate('/teacher/quizzes')}>
          Hủy
        </button>
      </form>
    </div>
  );
};

export default EditQuiz;
