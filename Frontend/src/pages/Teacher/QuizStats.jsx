import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

// ─── API helpers ────────────────────────────────────────────────────────────
async function getQuizPerformanceStats(quizId) {
    return apiClient.request(`/quizzes/${quizId}/performance-stats/`);
}

async function getQuizQuestionAnalysis(quizId) {
    return apiClient.request(`/quizzes/${quizId}/question-analysis/`);
}

async function exportQuizResults(quizId, quizTitle) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(
        `http://localhost:8000/api/quizzes/${quizId}/export-results/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ket_qua_thi_${quizId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
    return (
        <div className="qs-stat-card" style={{ '--accent': color }}>
            <div className="qs-stat-value">{value ?? '—'}</div>
            <div className="qs-stat-label">{label}</div>
        </div>
    );
}

function PerformanceTab({ quizId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getQuizPerformanceStats(quizId)
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [quizId]);

    if (loading) return <div className="qs-loading">Đang tải dữ liệu...</div>;
    if (error) return <div className="qs-error">Lỗi: {error}</div>;
    if (!data) return null;

    const { stats } = data;
    const avg = stats.average_score != null ? Number(stats.average_score).toFixed(1) : null;

    return (
        <div className="qs-performance">
            <h3 className="qs-section-title">Thống kê kết quả thi</h3>
            <p className="qs-quiz-name">{data.quiz_title}</p>
            <div className="qs-stats-grid">
                <StatCard label="Điểm trung bình" value={avg} color="#3b82f6" />
                <StatCard label="Điểm cao nhất" value={stats.highest_score} color="#10b981" />
                <StatCard label="Điểm thấp nhất" value={stats.lowest_score} color="#f59e0b" />
                <StatCard label="Tổng lượt thi" value={stats.total_attempts} color="#8b5cf6" />
            </div>
            {stats.total_attempts === 0 && (
                <div className="qs-empty">Chưa có lượt thi hoàn thành nào.</div>
            )}
        </div>
    );
}

function AnalysisTab({ quizId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getQuizQuestionAnalysis(quizId)
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [quizId]);

    if (loading) return <div className="qs-loading">Đang phân tích câu hỏi...</div>;
    if (error) return <div className="qs-error">Lỗi: {error}</div>;
    if (!data) return null;

    return (
        <div className="qs-analysis">
            <h3 className="qs-section-title">Phân tích câu hỏi khó</h3>
            <div className="qs-analysis-meta">
                <span>Tổng câu hỏi đã phân tích: <strong>{data.analyzed_questions_count}</strong></span>
                <span>Câu hỏi có tỉ lệ sai &gt; 70%: <strong>{data.hard_questions?.length ?? 0}</strong></span>
            </div>

            {!data.hard_questions || data.hard_questions.length === 0 ? (
                <div className="qs-empty">
                    ✅ Không có câu hỏi nào có tỉ lệ sai quá cao. Bài thi có độ khó hợp lý.
                </div>
            ) : (
                <div className="qs-hard-list">
                    {data.hard_questions.map((q, idx) => (
                        <div className="qs-hard-card" key={q.question_id}>
                            <div className="qs-hard-header">
                                <span className="qs-hard-index">#{idx + 1}</span>
                                <span className="qs-hard-rate" style={{
                                    color: q.error_rate > 90 ? '#ef4444' : '#f59e0b'
                                }}>
                                    {q.error_rate}% sai
                                </span>
                            </div>
                            <p className="qs-hard-content">{q.content}</p>
                            <div className="qs-hard-stats">
                                <span>Tổng trả lời: {q.total_answers}</span>
                                <span>Sai: {q.wrong_count}</span>
                            </div>
                            <div className="qs-hard-suggestion">
                                💡 {q.suggestion}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExportTab({ quizId, quizTitle }) {
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleExport = async () => {
        setExporting(true);
        setSuccess(false);
        setError(null);
        try {
            await exportQuizResults(quizId, quizTitle);
            setSuccess(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="qs-export">
            <h3 className="qs-section-title">Xuất kết quả thi</h3>
            <p className="qs-export-desc">
                Tải file Excel (.xlsx) chứa danh sách học sinh, điểm số và thời gian nộp bài của tất cả lượt thi đã hoàn thành.
            </p>
            <div className="qs-export-info">
                <div className="qs-export-info-item">📋 Họ &amp; Tên học sinh</div>
                <div className="qs-export-info-item">📧 Email</div>
                <div className="qs-export-info-item">🏆 Điểm số</div>
                <div className="qs-export-info-item">🕐 Thời gian nộp</div>
            </div>
            <button
                className="qs-export-btn"
                onClick={handleExport}
                disabled={exporting}
            >
                {exporting ? (
                    <><span className="qs-spinner" /> Đang xuất...</>
                ) : (
                    '⬇ Tải xuống Excel'
                )}
            </button>
            {success && (
                <div className="qs-success">✅ File đã được tải xuống thành công!</div>
            )}
            {error && (
                <div className="qs-error">❌ Lỗi: {error}</div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TABS = [
    { key: 'performance', label: '📊 Thống kê' },
    { key: 'analysis',    label: '🔍 Phân tích câu hỏi' },
    { key: 'export',      label: '⬇ Xuất kết quả' },
];

export default function QuizStats() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('performance');
    const [quizTitle, setQuizTitle] = useState('');

    useEffect(() => {
        apiClient.request(`/quizzes/${id}/`)
            .then(q => setQuizTitle(q.title || ''))
            .catch(() => {});
    }, [id]);

    return (
        <div className="admin-container">
            <div className="admin-card qs-wrapper">
                {/* Header */}
                <div className="qs-header">
                    <button className="secondary-btn" onClick={() => navigate(`/teacher/quizzes/${id}`)}>
                        ← Quay lại
                    </button>
                    <div>
                        <h2 className="qs-title">Thống kê &amp; Phân tích</h2>
                        {quizTitle && <p className="qs-subtitle">{quizTitle}</p>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="qs-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`qs-tab${activeTab === tab.key ? ' qs-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="qs-content">
                    {activeTab === 'performance' && <PerformanceTab quizId={id} />}
                    {activeTab === 'analysis'    && <AnalysisTab quizId={id} />}
                    {activeTab === 'export'      && <ExportTab quizId={id} quizTitle={quizTitle} />}
                </div>
            </div>
        </div>
    );
}