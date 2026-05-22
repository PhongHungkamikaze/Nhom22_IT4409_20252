import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Student.css';

export default function PersonalInfo() {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // READ: Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const userData = user || (await apiService.getUserProfile());
                if (userData) {
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                    });
                }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Không thể tải thông tin cá nhân');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // UPDATE: Save profile changes
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
            };
            
            console.log('Saving profile data:', updateData); // DEBUG
            
            const response = await apiService.updateUserProfile(updateData);
            console.log('Update response:', response); // DEBUG
            
            // Update localStorage
            const updatedUser = { ...user, ...updateData };
            login(updatedUser, localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'));
            
            setSuccess('✓ Cập nhật thành công!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to save profile - Full error:', err); // DEBUG
            console.error('Error message:', err.message); // DEBUG
            console.error('Error response:', err.response); // DEBUG
            
            setError(err.message || 'Không thể cập nhật thông tin. Vui lòng kiểm tra kết nối API.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-loading">
                    <div className="stu-spinner"></div>
                    <p>Đang tải thông tin...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Hero */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>Thông tin cá nhân</h1>
                        <p>Quản lý thông tin tài khoản của bạn</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-card stu-profile-card">
                        {/* Error Message */}
                        {error && (
                            <div className="stu-alert stu-alert-error">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="stu-alert stu-alert-success">
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSave} className="stu-form">
                            {/* Username (read-only) */}
                            <div className="stu-form-group">
                                <label className="stu-label">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="stu-input stu-input-disabled"
                                />
                                <p className="stu-help-text">
                                    Không thể thay đổi tên đăng nhập
                                </p>
                            </div>

                            {/* First Name */}
                            <div className="stu-form-group">
                                <label className="stu-label">
                                    Tên
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên của bạn"
                                    className="stu-input"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="stu-form-group">
                                <label className="stu-label">
                                    Họ
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Nhập họ của bạn"
                                    className="stu-input"
                                />
                            </div>

                            {/* Email */}
                            <div className="stu-form-group stu-form-group-last">
                                <label className="stu-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email của bạn"
                                    className="stu-input"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="stu-form-actions">
                                <button
                                    type="button"
                                    onClick={() => navigate('/student')}
                                    className="stu-action-btn stu-action-btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`stu-action-btn stu-action-btn-primary${saving ? ' is-disabled' : ''}`}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>

                        {/* Additional Info */}
                        <div className="stu-divider">
                            <h3 className="stu-section-subtitle">Thông tin tài khoản</h3>
                            <div className="stu-info-grid">
                                <div>
                                    <div className="stu-info-label">Vai trò</div>
                                    <div className="stu-info-value">Student</div>
                                </div>
                                <div>
                                    <div className="stu-info-label">Trạng thái</div>
                                    <div className="stu-info-value stu-info-value-positive">Hoạt động</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
