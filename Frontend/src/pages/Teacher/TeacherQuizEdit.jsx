import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Teacher.css';
import '../Admin/Admin.css';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';

// Fetch ALL pages từ một paginated API
async function fetchAllPages(fetchFn, params = {}) {
    let results = [];
    let page = 1;
    while (true) {
        const data = await fetchFn({ ...params, page, page_size: 100 });
        const items = Array.isArray(data) ? data : (data.results || []);
        results = [...results, ...items];
        // Nếu không có next hoặc đã lấy hết thì dừng
        if (!data.next || items.length === 0) break;
        page++;
    }
    return results;
}

const PAGE_SIZE = 10;

export default function TeacherQuizEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [addingExisting, setAddingExisting] = useState(false);

    // Pagination state cho available questions
    const [availPage, setAvailPage] = useState(1);
    const [availSearch, setAvailSearch] = useState('');

    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState([]);
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const subjectDropdownRef = useRef(null);
    const [teacherFilter, setTeacherFilter] = useState([]);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
    const teacherDropdownRef = useRef(null);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Filtered + paginated available questions
    const filteredAvail = availableQuestions.filter(q => {
        // Search filter
        if (availSearch.trim()) {
            const content = (q.content || q.question || q.title || '').toLowerCase();
            if (!content.includes(availSearch.toLowerCase())) return false;
        }
        // Type filter
        if (typeFilter !== 'all' && q.type !== typeFilter) return false;
        // Subject filter
        if (subjectFilter.length > 0 && !subjectFilter.includes(q.subject)) return false;
        // Teacher filter
        if (teacherFilter.length > 0) {
            const qAuthorId = q.author || q.author_id;
            if (!teacherFilter.includes(qAuthorId)) return false;
        }
        return true;
    });
    const totalPages = Math.ceil(filteredAvail.length / PAGE_SIZE);
    const pagedAvail = filteredAvail.slice((availPage - 1) * PAGE_SIZE, availPage * PAGE_SIZE);

    // Reset về trang 1 khi search hoặc filter thay đổi
    useEffect(() => { setAvailPage(1); }, [availSearch, typeFilter, subjectFilter, teacherFilter]);

    const loadAvailable = useCallback(async (existingQuestions) => {
        setLoadingAvailable(true);
        try {
            const allQs = await fetchAllPages(apiService.getQuestions.bind(apiService));
            const existingIds = new Set(
                existingQuestions.map(x => String(x.id || x.pk || x.question_id)).filter(Boolean)
            );
            const available = allQs.filter(q => !existingIds.has(String(q.id || q.pk)));
            setAvailableQuestions(available.map(q => ({ ...q, is_ready: false })));
        } catch (e) {
            console.error('Could not load question bank', e);
        } finally {
            setLoadingAvailable(false);
        }
    }, []);

    // click‑outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
                setIsSubjectDropdownOpen(false);
            }
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
                setIsTeacherDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Fetch filters
                const [subjData, teachData] = await Promise.all([
                    apiService.getSubjects(),
                    apiService.getUsers({ role: 'teacher' })
                ]);
                setSubjects(Array.isArray(subjData) ? subjData : (subjData.results || []));
                setTeachers(Array.isArray(teachData) ? teachData : (teachData.results || []));

                const data = await apiService.getQuiz(id);
                setQuiz(data);

                let initialQuestions = data.questions || [];
                if (initialQuestions.length === 0) {
                    try {
                        const qRes = await apiService.getQuizQuestions(id);
                        initialQuestions = Array.isArray(qRes) ? qRes : (qRes.results || []);
                    } catch { initialQuestions = []; }
                }
                setQuestions(initialQuestions);
                setTitle(data.title || '');
                setDescription(data.description || '');
                setTimeLimit(data.time_limit ? String(data.time_limit) : (data.duration ? String(data.duration) : ''));
                setIsPublished(Boolean(data.is_published));

                await loadAvailable(initialQuestions);
            } catch (err) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, loadAvailable]);

    const reloadAvailable = () => loadAvailable(questions);

    const toggleAvailableReady = (qId) => {
        setAvailableQuestions(prev => prev.map(q => {
            const id = q.id || q.pk || q.question_id;
            if (String(id) === String(qId)) return { ...q, is_ready: !q.is_ready };
            return q;
        }));
    };

    const selectAllOnPage = () => {
        const pageIds = new Set(pagedAvail.map(q => String(q.id || q.pk || q.question_id)));
        setAvailableQuestions(prev => prev.map(q => ({
            ...q,
            is_ready: pageIds.has(String(q.id || q.pk || q.question_id)) ? true : q.is_ready,
        })));
    };

    const deselectAll = () => {
        setAvailableQuestions(prev => prev.map(q => ({ ...q, is_ready: false })));
    };

    const handleAddSelected = async () => {
        const selected = availableQuestions.filter(q => q.is_ready);
        if (selected.length === 0) return alert('Vui lòng chọn ít nhất một câu hỏi để thêm.');
        setAddingExisting(true);
        try {
            const existingIds = questions.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            const selectedIds = selected.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            const newQuestionIds = [...existingIds, ...selectedIds];
            await apiService.partialUpdateQuiz(id, { question_ids: newQuestionIds });
            setQuestions(prev => [...prev, ...selected]);
            setAvailableQuestions(prev => prev.filter(q => !q.is_ready));
        } catch (err) {
            console.error('Failed to add selected questions', err);
            alert('Không thể thêm câu hỏi. Xem console để biết chi tiết.');
        } finally {
            setAddingExisting(false);
        }
    };

    const handleAddSingle = async (q) => {
        const qId = q.id || q.pk || q.question_id;
        try {
            const existingIds = questions.map(x => x.id || x.pk || x.question_id).filter(Boolean);
            await apiService.partialUpdateQuiz(id, { question_ids: [...existingIds, qId] });
            setQuestions(prev => [...prev, q]);
            setAvailableQuestions(prev => prev.filter(x => String(x.id || x.pk || x.question_id) !== String(qId)));
        } catch (err) {
            alert('Không thể thêm câu hỏi. Xem console để biết chi tiết.');
        }
    };

    const handleRemoveQuestion = async (qId) => {
        if (!window.confirm('Xác nhận xóa câu hỏi này khỏi quiz?')) return;
        try {
            const newIds = questions
                .filter(x => String(x.id || x.pk || x.question_id) !== String(qId))
                .map(x => Number(x.id || x.pk || x.question_id))
                .filter(Boolean);
            await apiService.partialUpdateQuiz(id, { question_ids: newIds });
            const removed = questions.find(x => String(x.id || x.pk || x.question_id) === String(qId));
            setQuestions(prev => prev.filter(x => String(x.id || x.pk || x.question_id) !== String(qId)));
            if (removed) setAvailableQuestions(prev => [...prev, { ...removed, is_ready: false }]);
        } catch {
            alert('Không thể xóa câu hỏi.');
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        if (!title.trim()) { setError('Title required'); return; }
        setSaving(true); setError(null);
        try {
            const questionIds = questions.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            await apiService.partialUpdateQuiz(id, {
                title: title.trim(),
                description: description.trim(),
                time_limit: Number(timeLimit) || 0,
                is_published: Boolean(isPublished),
                question_ids: questionIds,
            });
            navigate(`/teacher/quizzes/${id}`);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error && !quiz) return <div className="admin-container"><div className="admin-card">Error: {error}</div></div>;
    if (!quiz) return <div className="admin-container"><div className="admin-card">Quiz not found</div></div>;

    const uid = user && (user.id || user.user_id || user.pk);
    const isAuthor = uid && (
        quiz.author === uid || quiz.author_id === uid ||
        String(quiz.author) === String(uid) ||
        (quiz.author_username && user.username && quiz.author_username === user.username)
    );
    if (!isAuthor) return (
        <div className="admin-container"><div className="admin-card">
            <h2>Not allowed</h2><p>You are not the author of this quiz.</p>
        </div></div>
    );

    const selectedCount = availableQuestions.filter(q => q.is_ready).length;

    return (
        <div className="admin-container">
            <div className="admin-card teacher-quiz-edit">
                <h2 style={{ marginBottom: 20 }}>Edit Quiz</h2>

                {/* ── Quiz info form ── */}
                <form onSubmit={handleSave} className="create-quiz-form">
                    <table className="table edit-table">
                        <tbody>
                            <tr>
                                <td style={{ width: 200, fontWeight: 600 }}>Title</td>
                                <td><input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} /></td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'top', fontWeight: 600 }}>Description</td>
                                <td><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ width: '100%' }} /></td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Time limit (minutes)</td>
                                <td><input type="number" min={0} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} /></td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Published</td>
                                <td>
                                    <label>
                                        <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
                                        {' '}Publish this quiz
                                    </label>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {error && <p className="error-message">{error}</p>}
                </form>

                {/* ── Current questions ── */}
                <section style={{ marginTop: 28 }}>
                    <h3>Questions <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#6b7280' }}>({questions.length} câu)</span></h3>
                    <div className="table-responsive" style={{ marginTop: 12 }}>
                        <table className="table">
                            <thead>
                                <tr><th>Question</th><th>Choices</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {questions.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af' }}>No questions yet.</td></tr>
                                ) : questions.map(q => {
                                    const qId = q.id || q.pk || q.question_id;
                                    return (
                                        <tr key={qId}>
                                            <td>{q.content || q.question || q.title || ''}</td>
                                            <td>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {(q.choices || []).map((c, i) => (
                                                        <li key={c.id || i} style={{ color: c.is_correct ? '#059669' : undefined, fontWeight: c.is_correct ? 600 : undefined }}>
                                                            {c.content || c.text || String(c)}
                                                            {c.is_correct && ' ✓'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn danger" onClick={async () => {
                                                        if (!window.confirm('Xác nhận xóa câu hỏi này khỏi quiz?')) return;
                                                        try {
                                                            const newQuestionIds = questions
                                                                .filter(x => (x.id || x.pk || x.question_id) !== qId)
                                                                .map(x => x.id || x.pk || x.question_id)
                                                                .filter(Boolean)
                                                                .map(x => Number(x));

                                                            await apiService.partialUpdateQuiz(id, { question_ids: newQuestionIds });

                                                            setQuestions(prev => prev.filter(x => (x.id || x.pk || x.question_id) !== qId));
                                                            const removedQ = questions.find(x => (x.id || x.pk || x.question_id) === qId);
                                                            if (removedQ) {
                                                                setAvailableQuestions(prev => [...prev, { ...removedQ, is_ready: false }]);
                                                            }
                                                        } catch (err) {
                                                            console.error('Failed to delete question from quiz', err);
                                                            alert('Không thể xóa câu hỏi. Xem console để biết chi tiết.');
                                                        }
                                                    }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {questions.length === 0 && (
                                    <tr><td colSpan="3">No questions yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                </section>
                {/* ── Available questions ── */}
                < section style={{ marginTop: 28 }
                }>
                    <h3>
                        Available questions (Question bank)
                        <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#6b7280', marginLeft: 8 }}>
                            ({filteredAvail.length} câu{availSearch ? ' khớp tìm kiếm' : ''})
                        </span>
                    </h3>
                    {/* Toolbar */}
                    <div className="qe-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', marginBottom: 16 }}>
                        {/* First row: Search bar, Reload, and Select all on page */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Tìm câu hỏi..."
                                    value={availSearch}
                                    onChange={e => setAvailSearch(e.target.value)}
                                />
                            </div>
                            <button className="secondary-btn" type="button" onClick={reloadAvailable} disabled={loadingAvailable}>
                                {loadingAvailable ? 'Đang tải...' : '↺ Tải lại'}
                            </button>
                            <button className="secondary-btn" type="button" onClick={selectAllOnPage}>
                                Chọn trang này
                            </button>
                        </div>
                        {/* Second row: Filters and batch action buttons */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {selectedCount > 0 && (
                                    <>
                                        <button className="secondary-btn" type="button" onClick={deselectAll}>
                                            Bỏ chọn tất cả
                                        </button>
                                        <button
                                            className="primary-btn"
                                            type="button"
                                            onClick={handleAddSelected}
                                            disabled={addingExisting}
                                        >
                                            {addingExisting ? 'Đang thêm...' : `✚ Thêm ${selectedCount} câu đã chọn`}
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="filter-group" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: 0, marginLeft: 'auto' }}>
                                <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                    <option value="all">Tất cả loại câu</option>
                                    <option value="single">Một lựa chọn</option>
                                    <option value="multiple">Nhiều lựa chọn</option>
                                </select>
                                <div className={`multi-select-container ${isSubjectDropdownOpen ? 'open' : ''}`} ref={subjectDropdownRef}>
                                    <div
                                        className="filter-select multi-select-trigger"
                                        onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                                    >
                                        <span>{subjectFilter.length === 0 ? 'Tất cả môn học' : `Môn học (${subjectFilter.length})`}</span>
                                        <span className="multi-select-arrow">▼</span>
                                    </div>
                                    {isSubjectDropdownOpen && (
                                        <div className="multi-select-dropdown">
                                            <div className="multi-select-option" onClick={() => setSubjectFilter([])}>
                                                <input type="checkbox" checked={subjectFilter.length === 0} onChange={() => {}} />
                                                <span>Tất cả môn học</span>
                                            </div>
                                            {subjects.map(s => {
                                                const isChecked = subjectFilter.includes(s.id);
                                                return (
                                                    <div key={s.id} className="multi-select-option" onClick={() => {
                                                        if (isChecked) {
                                                            setSubjectFilter(subjectFilter.filter(id => id !== s.id));
                                                        } else {
                                                            setSubjectFilter([...subjectFilter, s.id]);
                                                        }
                                                    }}>
                                                        <input type="checkbox" checked={isChecked} onChange={() => {}} />
                                                        <span>{s.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className={`multi-select-container ${isTeacherDropdownOpen ? 'open' : ''}`} ref={teacherDropdownRef}>
                                    <div
                                        className="filter-select multi-select-trigger"
                                        onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                                    >
                                        <span>
                                            {teacherFilter.length === 0
                                                ? 'Tất cả giáo viên'
                                                : `Giáo viên (${teacherFilter.length})`}
                                        </span>
                                        <span className="multi-select-arrow">▼</span>
                                    </div>
                                    {isTeacherDropdownOpen && (
                                        <div className="multi-select-dropdown">
                                            <div
                                                className="multi-select-option"
                                                onClick={() => setTeacherFilter([])}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={teacherFilter.length === 0}
                                                    onChange={() => {}}
                                                />
                                                <span>Tất cả giáo viên</span>
                                            </div>
                                            {teachers.map(t => {
                                                const isChecked = teacherFilter.includes(t.id);
                                                return (
                                                    <div
                                                        key={t.id}
                                                        className="multi-select-option"
                                                        onClick={() => {
                                                            if (isChecked) {
                                                                setTeacherFilter(teacherFilter.filter(id => id !== t.id));
                                                            } else {
                                                                setTeacherFilter([...teacherFilter, t.id]);
                                                            }
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {}}
                                                        />
                                                        <span>{t.username}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Table */}
                    <div className="table-responsive" style={{ marginTop: 12 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: 50 }}>
                                        <input
                                            type="checkbox"
                                            title="Chọn/bỏ tất cả trang này"
                                            checked={pagedAvail.length > 0 && pagedAvail.every(q => q.is_ready)}
                                            onChange={e => {
                                                const pageIds = new Set(pagedAvail.map(q => String(q.id || q.pk || q.question_id)));
                                                setAvailableQuestions(prev => prev.map(q => ({
                                                    ...q,
                                                    is_ready: pageIds.has(String(q.id || q.pk || q.question_id))
                                                        ? e.target.checked
                                                        : q.is_ready,
                                                })));
                                            }}
                                        />
                                    </th>
                                    <th>Câu hỏi</th>
                                    <th>Đáp án</th>
                                    <th style={{ width: 80 }}>Thêm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingAvailable ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: 24 }}>Đang tải câu hỏi...</td></tr>
                                ) : pagedAvail.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                                        {availSearch ? 'Không tìm thấy câu hỏi khớp.' : 'Không còn câu hỏi nào trong ngân hàng.'}
                                    </td></tr>
                                ) : pagedAvail.map(q => {
                                    const qId = q.id || q.pk || q.question_id;
                                    return (
                                        <tr key={qId} className={q.is_ready ? 'qe-row--selected' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(q.is_ready)}
                                                    onChange={() => toggleAvailableReady(qId)}
                                                />
                                            </td>
                                            <td>{q.content || q.question || q.title || ''}</td>
                                            <td>
                                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                    {(q.choices || []).map((c, i) => (
                                                        <li key={c.id || i} style={{ color: c.is_correct ? '#059669' : undefined }}>
                                                            {c.content || c.text || String(c)}
                                                            {c.is_correct && ' ✓'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <button className="text-btn" onClick={() => handleAddSingle(q)}>Thêm</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={availPage}
                            totalPages={totalPages}
                            onPageChange={setAvailPage}
                            totalCount={filteredAvail.length}
                            pageSize={PAGE_SIZE}
                            itemLabel="câu hỏi"
                        />
                    )}
                </section>

                {/* ── Save / Cancel ── */}
                <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 28 }}>
                    <button className="primary-btn" type="button" onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : '💾 Lưu tất cả'}
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => navigate(-1)} disabled={saving}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}
