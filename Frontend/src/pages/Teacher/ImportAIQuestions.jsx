import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import './Teacher.css';

export default function ImportAIQuestions() {
    const navigate = useNavigate();

    // State for both tabs
    const [activeTab, setActiveTab] = useState('bulk-import'); // 'bulk-import' or 'ai-generate'
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSubjects, setFetchingSubjects] = useState(true);

    // Bulk Import State
    const [importFile, setImportFile] = useState(null);
    const [importSubjectId, setImportSubjectId] = useState('');
    const [importProgress, setImportProgress] = useState(null);

    // AI Generation State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [aiSubjectId, setAiSubjectId] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);

    // Load subjects on mount
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const data = await apiService.getSubjects();
                const subjectsList = Array.isArray(data) ? data : (data.results || []);
                setSubjects(subjectsList);
                if (subjectsList.length > 0) {
                    setImportSubjectId(subjectsList[0].id);
                    setAiSubjectId(subjectsList[0].id);
                }
            } catch (err) {
                console.error('Failed to load subjects', err);
                toast.error('Không thể tải danh sách môn học');
            } finally {
                setFetchingSubjects(false);
            }
        };
        loadSubjects();
    }, []);

    // Handle bulk import
    const handleBulkImport = async (e) => {
        e.preventDefault();

        if (!importFile) {
            toast.error('Vui lòng chọn file');
            return;
        }

        if (!importSubjectId) {
            toast.error('Vui lòng chọn môn học');
            return;
        }

        // Check file type
        const fileName = importFile.name;
        if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            toast.error('Chỉ hỗ trợ file .csv hoặc .xlsx');
            return;
        }

        setLoading(true);
        setImportProgress({ status: 'uploading', message: 'Đang tải lên file...' });

        try {
            const result = await apiService.bulkImportQuestions(importFile, importSubjectId);
            
            setImportProgress({
                status: 'success',
                message: `✅ Đã import thành công ${result.created_count || 0} câu hỏi!`
            });

            if (result.errors && result.errors.length > 0) {
                console.warn('Import errors:', result.errors);
            }

            toast.success(`Đã import thành công ${result.created_count || 0} câu hỏi!`);

            // Reset form
            setImportFile(null);
            setTimeout(() => {
                setImportProgress(null);
                navigate('/teacher/questions');
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Lỗi khi import câu hỏi';
            setImportProgress({
                status: 'error',
                message: `❌ ${errorMsg}`
            });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Handle AI generation
    const handleAIGeneration = async (e) => {
        e.preventDefault();

        if (!aiPrompt.trim()) {
            toast.error('Vui lòng nhập mô tả câu hỏi');
            return;
        }

        if (aiCount < 1 || aiCount > 20) {
            toast.error('Số lượng câu hỏi phải từ 1 đến 20');
            return;
        }

        if (!aiSubjectId) {
            toast.error('Vui lòng chọn môn học');
            return;
        }

        setAiGenerating(true);
        const toastId = toast.loading('🤖 Đang tạo câu hỏi bằng AI...');

        try {
            const result = await apiService.generateAIQuestions(
                aiPrompt,
                parseInt(aiCount),
                aiSubjectId
            );

            toast.dismiss(toastId);
            toast.success(`✨ Đã tạo thành công ${result.questions?.length || aiCount} câu hỏi!`);

            // Show result modal or navigate
            setTimeout(() => {
                navigate('/teacher/questions');
            }, 1500);
        } catch (err) {
            toast.dismiss(toastId);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Lỗi khi tạo câu hỏi bằng AI';
            toast.error(errorMsg);
            console.error('AI generation error:', err);
        } finally {
            setAiGenerating(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
            setImportProgress(null);
        }
    };

    if (fetchingSubjects) {
        return <div className="admin-container"><p>Đang tải môn học...</p></div>;
    }

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">📚 Nhập & Tạo Câu Hỏi</h1>
                    <p className="admin-subtitle">Nhập câu hỏi từ file hoặc tạo bằng AI</p>
                </div>
                <button className="secondary-btn" onClick={() => navigate('/teacher/questions')}>
                    ← Quay lại
                </button>
            </header>

            <div className="admin-card">
                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'bulk-import' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bulk-import')}
                        >
                            📤 Nhập từ File
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'ai-generate' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai-generate')}
                        >
                            🤖 Tạo bằng AI
                        </button>
                    </div>

                    {/* Bulk Import Tab */}
                    {activeTab === 'bulk-import' && (
                        <div className="tab-content">
                            <form onSubmit={handleBulkImport}>
                                <div className="form-section">
                                    <h3>📋 Nhập Câu Hỏi từ File</h3>
                                    <p className="form-description">
                                        Hỗ trợ file CSV hoặc Excel (.xlsx). File phải có các cột: content, type, choices (tuỳ chọn)
                                    </p>

                                    <div className="form-group">
                                        <label>Chọn Môn Học</label>
                                        <select
                                            className="filter-select"
                                            value={importSubjectId}
                                            onChange={(e) => setImportSubjectId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Chọn môn học --</option>
                                            {subjects.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Chọn File (CSV hoặc Excel)</label>
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id="file-input"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileChange}
                                                disabled={loading}
                                            />
                                            <label htmlFor="file-input" className="file-input-label">
                                                {importFile ? `✓ ${importFile.name}` : '📎 Chọn hoặc kéo thả file'}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Progress indicator */}
                                    {importProgress && (
                                        <div className={`progress-box progress-${importProgress.status}`}>
                                            <p>{importProgress.message}</p>
                                        </div>
                                    )}

                                    {/* Download template */}
                                    <div className="template-section">
                                        <p className="section-title">📝 Mẫu File</p>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                            Tải template file CSV để biết cấu trúc cần thiết
                                        </p>
                                        <button
                                            type="button"
                                            className="text-btn"
                                            onClick={() => {
                                                // Generate CSV template
                                                const csv = 'content,type,choices\n"Câu hỏi 1",single,"Đáp án A|Đáp án B|Đáp án C*"\n"Câu hỏi 2",multiple,"Tùy chọn A*|Tùy chọn B*|Tùy chọn C"';
                                                const blob = new Blob([csv], { type: 'text/csv' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'template.csv';
                                                a.click();
                                                toast.success('Đã tải template file!');
                                            }}
                                        >
                                            ⬇️ Tải Template CSV
                                        </button>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="primary-btn"
                                            disabled={loading || !importFile}
                                        >
                                            {loading ? '⏳ Đang xử lý...' : '📤 Nhập Câu Hỏi'}
                                        </button>
                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() => navigate('/teacher/questions')}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* AI Generate Tab */}
                    {activeTab === 'ai-generate' && (
                        <div className="tab-content">
                            <form onSubmit={handleAIGeneration}>
                                <div className="form-section">
                                    <h3>🤖 Tạo Câu Hỏi bằng AI</h3>
                                    <p className="form-description">
                                        Mô tả loại câu hỏi bạn muốn tạo, AI sẽ tự động sinh ra câu hỏi và đáp án
                                    </p>

                                    <div className="form-group">
                                        <label>Chọn Môn Học</label>
                                        <select
                                            className="filter-select"
                                            value={aiSubjectId}
                                            onChange={(e) => setAiSubjectId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Chọn môn học --</option>
                                            {subjects.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Mô Tả Câu Hỏi</label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="VD: Tạo 5 câu hỏi về các loại hoa với 4 đáp án mỗi câu..."
                                            rows="5"
                                            disabled={aiGenerating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Số Lượng Câu Hỏi (1-20)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={aiCount}
                                            onChange={(e) => setAiCount(e.target.value)}
                                            disabled={aiGenerating}
                                        />
                                    </div>

                                    {/* AI Tips */}
                                    <div className="tips-section">
                                        <p className="section-title">💡 Mẹo Viết Prompt Tốt</p>
                                        <ul className="tips-list">
                                            <li>Mô tả chi tiết về chủ đề: "Câu hỏi về Thế Chiến II"</li>
                                            <li>Chỉ định loại: "Câu hỏi trắc nghiệm 4 lựa chọn"</li>
                                            <li>Mức độ khó: "Câu hỏi ở mức độ trung bình"</li>
                                            <li>Số lượng và format: "Tạo 5 câu hỏi có đáp án rõ ràng"</li>
                                        </ul>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="primary-btn"
                                            disabled={aiGenerating}
                                        >
                                            {aiGenerating ? '⏳ Đang tạo...' : '✨ Tạo Câu Hỏi'}
                                        </button>
                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() => navigate('/teacher/questions')}
                                            disabled={aiGenerating}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
