import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
    FiUser, 
    FiMail, 
    FiShield, 
    FiInfo, 
    FiAward, 
    FiBookOpen, 
    FiActivity, 
    FiCheckCircle 
} from 'react-icons/fi';
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
    const [stats, setStats] = useState({
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: '--',
        highestScore: '--'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Get time-of-day greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    // Get initials for Avatar
    const getInitials = () => {
        if (formData.first_name && formData.last_name) {
            return `${formData.last_name[0]}${formData.first_name[0]}`.toUpperCase();
        }
        if (formData.first_name) return formData.first_name.slice(0, 2).toUpperCase();
        if (formData.username) return formData.username.slice(0, 2).toUpperCase();
        return 'ST';
    };

    // Fetch user profile and quiz statistics
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch profile
                const userData = user || (await apiService.getUserProfile());
                if (userData) {
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                    });
                }

                // Fetch attempts stats
                const attemptsData = apiService.getAttempts 
                    ? await apiService.getAttempts() 
                    : await apiService.request('/attempts/');
                
                const attemptList = Array.isArray(attemptsData.results)
                    ? attemptsData.results
                    : Array.isArray(attemptsData) ? attemptsData : [];

                const completedAttempts = attemptList.filter(a => a.status === 'completed');
                const completedCount = completedAttempts.length;

                const scores = completedAttempts
                    .map(a => Number(a.score))
                    .filter(s => !isNaN(s));

                const averageScore = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                    : '--';

                const highestScore = scores.length > 0
                    ? Math.max(...scores).toFixed(1)
                    : '--';

                setStats({
                    totalAttempts: attemptList.length,
                    completedAttempts: completedCount,
                    averageScore,
                    highestScore
                });

            } catch (err) {
                console.error('Failed to fetch profile/stats data:', err);
                toast.error('Không thể tải thông tin cá nhân hoặc thống kê học tập.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save profile changes
    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            toast.error('Họ và tên không được để trống.');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email không được để trống.');
            return;
        }

        try {
            setSaving(true);
            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
            };

            const response = await apiService.updateUserProfile(updateData);
            
            // Sync with context & localStorage
            const updatedUser = response.user || { ...user, ...updateData };
            login(updatedUser, localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'));

            toast.success('Cập nhật thông tin hồ sơ thành công!');
        } catch (err) {
            console.error('Failed to save profile:', err);
            const errorMsg = err?.data && typeof err.data === 'object'
                ? Object.values(err.data).flat().join(' ')
                : err.message || 'Không thể cập nhật thông tin. Vui lòng kiểm tra kết nối API.';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-loading">
                    <div className="stu-spinner"></div>
                    <p>Đang tải thông tin cá nhân của bạn...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Hero Banner */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiUser className="stu-badge-icon" />
                                Hồ Sơ Học Viên
                            </div>
                            <h1>{getGreeting()}, {formData.first_name || user?.username || 'Học viên'}</h1>
                            <p>Xem thông tin chi tiết tài khoản của bạn và theo dõi tiến trình thống kê học tập cá nhân tại đây.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="stu-profile-container">
                <div className="stu-profile-grid">
                    
                    {/* Left Column: Avatar & Quick Stats */}
                    <div className="stu-profile-left-col">
                        
                        {/* Avatar card */}
                        <div className="stu-profile-avatar-card">
                            <div className="stu-avatar-wrapper">
                                <div className="stu-profile-avatar">
                                    {getInitials()}
                                </div>
                                <span className="stu-avatar-status-dot" title="Đang hoạt động"></span>
                            </div>
                            <h2 className="stu-profile-name">
                                {formData.last_name} {formData.first_name}
                            </h2>
                            <p className="stu-profile-username">@{formData.username}</p>
                            
                            <div className="stu-profile-badges">
                                <span className="stu-role-badge">
                                    <FiShield /> Student
                                </span>
                                <span className="stu-status-badge-pill">
                                    <FiCheckCircle /> Hoạt động
                                </span>
                            </div>

                            <div className="stu-profile-meta-info">
                                <div className="stu-meta-item">
                                    <span className="stu-meta-label">ID tài khoản:</span>
                                    <span className="stu-meta-value">#{user?.id || 'N/A'}</span>
                                </div>
                                <div className="stu-meta-item">
                                    <span className="stu-meta-label">Vai trò:</span>
                                    <span className="stu-meta-value">Học sinh</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats card */}
                        <div className="stu-profile-stats-card">
                            <h3 className="stu-stats-card-title">
                                <FiActivity /> Thống kê học tập
                            </h3>
                            <div className="stu-stats-row">
                                <div className="stu-stat-box">
                                    <FiBookOpen className="stu-stat-box-icon" />
                                    <div className="stu-stat-box-number">{stats.totalAttempts}</div>
                                    <div className="stu-stat-box-label">Lần làm bài</div>
                                </div>
                                <div className="stu-stat-box">
                                    <FiCheckCircle className="stu-stat-box-icon" />
                                    <div className="stu-stat-box-number">{stats.completedAttempts}</div>
                                    <div className="stu-stat-box-label">Đã hoàn thành</div>
                                </div>
                                <div className="stu-stat-box">
                                    <FiAward className="stu-stat-box-icon" />
                                    <div className="stu-stat-box-number">{stats.averageScore}</div>
                                    <div className="stu-stat-box-label">Điểm TB</div>
                                </div>
                                <div className="stu-stat-box">
                                    <FiAward className="stu-stat-box-icon" style={{ color: '#eab308' }} />
                                    <div className="stu-stat-box-number">{stats.highestScore}</div>
                                    <div className="stu-stat-box-label">Điểm cao nhất</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Profile Edit Form */}
                    <div className="stu-profile-form-card">
                        <h3 className="stu-form-section-title">
                            <FiInfo /> Thông tin cá nhân
                        </h3>
                        <p className="stu-form-section-desc">
                            Cập nhật thông tin chi tiết của bạn để giáo viên và hệ thống có thể hiển thị chính xác nhất.
                        </p>

                        <form onSubmit={handleSave} className="stu-profile-form">
                            
                            {/* Username (read-only) */}
                            <div className="stu-form-group stu-form-full-width">
                                <label className="stu-field-label">
                                    <FiUser /> Tên đăng nhập (Username)
                                </label>
                                <div className="stu-input-wrapper">
                                    <input
                                        type="text"
                                        value={formData.username}
                                        disabled
                                        className="stu-input-with-icon stu-input-disabled-premium"
                                    />
                                    <FiUser className="stu-input-icon" />
                                </div>
                                <p className="stu-input-tip">
                                    Không thể thay đổi tên đăng nhập của hệ thống.
                                </p>
                            </div>

                            {/* Last Name */}
                            <div className="stu-form-group">
                                <label className="stu-field-label">
                                    Họ đệm của bạn
                                </label>
                                <div className="stu-input-wrapper">
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="Nhập họ đệm"
                                        className="stu-input-with-icon"
                                        required
                                    />
                                    <FiUser className="stu-input-icon" />
                                </div>
                            </div>

                            {/* First Name */}
                            <div className="stu-form-group">
                                <label className="stu-field-label">
                                    Tên của bạn
                                </label>
                                <div className="stu-input-wrapper">
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên"
                                        className="stu-input-with-icon"
                                        required
                                    />
                                    <FiUser className="stu-input-icon" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="stu-form-group stu-form-full-width">
                                <label className="stu-field-label">
                                    <FiMail /> Địa chỉ Email
                                </label>
                                <div className="stu-input-wrapper">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ email"
                                        className="stu-input-with-icon"
                                        required
                                    />
                                    <FiMail className="stu-input-icon" />
                                </div>
                                <p className="stu-input-tip">
                                    Dùng để nhận các thông tin liên quan đến kết quả bài quiz và thông báo hệ thống.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="stu-form-actions-premium">
                                <button
                                    type="button"
                                    onClick={() => navigate('/student')}
                                    className="stu-btn-cancel-premium"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="stu-btn-save-premium"
                                >
                                    {saving ? (
                                        <>
                                            <span className="stu-loading-spinner-btn"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'Lưu thay đổi'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
