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
                        <h1>👤 Thông Tin Cá Nhân</h1>
                        <p>Quản lý thông tin tài khoản của bạn</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#fee',
                                color: '#c33',
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#efe',
                                color: '#3c3',
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSave}>
                            {/* Username (read-only) */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#333'
                                }}>
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#f5f5f5',
                                        fontFamily: 'inherit',
                                        cursor: 'not-allowed'
                                    }}
                                />
                                <p style={{ fontSize: '0.9rem', color: '#999', margin: '0.5rem 0 0 0' }}>
                                    Không thể thay đổi tên đăng nhập
                                </p>
                            </div>

                            {/* First Name */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#333'
                                }}>
                                    Tên
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên của bạn"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Last Name */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#333'
                                }}>
                                    Họ
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Nhập họ của bạn"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#333'
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email của bạn"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/student')}
                                    style={{
                                        padding: '10px 30px',
                                        backgroundColor: '#e0e0e0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: '10px 30px',
                                        backgroundColor: saving ? '#ccc' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {saving ? '⏳ Đang lưu...' : '✓ Lưu thay đổi'}
                                </button>
                            </div>
                        </form>

                        {/* Additional Info */}
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid #eee'
                        }}>
                            <h3 style={{ marginTop: 0, color: '#333' }}>📋 Thông tin tài khoản</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#666' }}>Vai trò</div>
                                    <div style={{ color: '#333', marginTop: '0.5rem' }}>
                                        🎓 Student
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#666' }}>Trạng thái</div>
                                    <div style={{ color: '#28a745', marginTop: '0.5rem' }}>
                                        ✓ Hoạt động
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
