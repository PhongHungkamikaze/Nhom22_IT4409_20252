import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import './Teacher.css';

export default function TeacherClassGroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('members');
    const [studentIds, setStudentIds] = useState('');
    const [assignedQuizzes, setAssignedQuizzes] = useState([]);
    const [quizList, setQuizList] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [dueDate, setDueDate] = useState('');

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await apiService.getClassGroupMembers(id);
            setGroup(data);
            setMembers(data.members || []);
            setError(null);

            const quizzesData = await apiService.getAssignedQuizzes(id);
            setAssignedQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (err) {
            console.error('Failed to load class group detail', err);
            setError('Không thể tải chi tiết lớp học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'assign') {
            apiService.getQuizzes({ page_size: 100 }).then(data => {
                const list = data.results || (Array.isArray(data) ? data : []);
                setQuizList(list);
            }).catch(() => {});
        }
    }, [activeTab]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!studentIds.trim()) return;
        const ids = studentIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (ids.length === 0) return;
        try {
            const result = await apiService.addStudentToClassGroup(id, ids);
            const msgs = [];
            if (result.added?.length) msgs.push(`Đã thêm: ${result.added.join(', ')}`);
            if (result.already_in?.length) msgs.push(`Đã có trong lớp: ${result.already_in.join(', ')}`);
            toast.success(msgs.join('. ') || 'Thao tác thành công!');
            setStudentIds('');
            fetchDetail();
        } catch (err) {
            toast.error(err.data?.message || 'Thêm sinh viên thất bại.');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sinh viên này khỏi lớp?')) return;
        try {
            await apiService.removeStudentFromClassGroup(id, studentId);
            toast.success('Xóa sinh viên thành công!');
            fetchDetail();
        } catch (err) {
            toast.error('Xóa sinh viên thất bại.');
        }
    };

    const handleAssignQuiz = async (e) => {
        e.preventDefault();
        if (!selectedQuizId) return;
        try {
            await apiService.assignQuizToClassGroup(id, parseInt(selectedQuizId), dueDate || null);
            toast.success('Gán bài quiz thành công!');
            setSelectedQuizId('');
            setDueDate('');
            const quizzesData = await apiService.getAssignedQuizzes(id);
            setAssignedQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (err) {
            toast.error(err.data?.message || 'Gán quiz thất bại.');
        }
    };

    if (loading) return (
        <div className="admin-container">
            <QuickSystem />
            <p style={{ padding: '20px' }}>Đang tải...</p>
        </div>
    );

    if (error) return (
        <div className="admin-container">
            <QuickSystem />
            <p className="error-message" style={{ padding: '20px' }}>{error}</p>
        </div>
    );

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">{group?.name}</h1>
                    <p className="admin-subtitle">{group?.description || 'Không có mô tả'}</p>
                </div>
                <button className="text-btn" onClick={() => navigate('/teacher/class-groups')}>
                    ← Quay lại
                </button>
            </header>

            <div className="admin-card">
                <div className="tabs-header">
                    <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
                        Thành viên ({members.length})
                    </button>
                    <button className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`} onClick={() => setActiveTab('assign')}>
                        Gán Quiz
                    </button>
                    <button className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => setActiveTab('assigned')}>
                        Quiz đã gán
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'members' && (
                        <>
                            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>ID sinh viên (cách nhau bằng dấu phẩy)</label>
                                    <input
                                        type="text"
                                        className="filter-select"
                                        style={{ width: '100%', padding: '10px' }}
                                        placeholder="VD: 1, 2, 3"
                                        value={studentIds}
                                        onChange={(e) => setStudentIds(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="primary-btn">Thêm sinh viên</button>
                            </form>

                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tên đăng nhập</th>
                                            <th>Email</th>
                                            <th>Họ tên</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map(member => (
                                            <tr key={member.id}>
                                                <td>{member.id}</td>
                                                <td><strong>{member.username}</strong></td>
                                                <td>{member.email}</td>
                                                <td>{member.first_name} {member.last_name}</td>
                                                <td>
                                                    <button className="text-btn danger" onClick={() => handleRemoveStudent(member.id)}>Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {members.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có sinh viên nào.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'assign' && (
                        <form onSubmit={handleAssignQuiz} style={{ maxWidth: '500px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Chọn Quiz</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%', padding: '10px' }}
                                    value={selectedQuizId}
                                    onChange={(e) => setSelectedQuizId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn quiz --</option>
                                    {quizList.map(q => (
                                        <option key={q.id} value={q.id}>{q.title} (ID: {q.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Hạn nộp (không bắt buộc)</label>
                                <input
                                    type="datetime-local"
                                    className="filter-select"
                                    style={{ width: '100%', padding: '10px' }}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="primary-btn">Gán Quiz</button>
                        </form>
                    )}

                    {activeTab === 'assigned' && (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Quiz</th>
                                        <th>Người gán</th>
                                        <th>Hạn nộp</th>
                                        <th>Ngày gán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedQuizzes.map(aq => (
                                        <tr key={aq.id}>
                                            <td><strong>{aq.quiz_title}</strong></td>
                                            <td>{aq.assigned_by_username}</td>
                                            <td>{aq.due_date ? new Date(aq.due_date).toLocaleDateString('vi-VN') : 'Không có'}</td>
                                            <td>{new Date(aq.created_at).toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                    {assignedQuizzes.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Chưa gán quiz nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
