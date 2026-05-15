import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';
import './TakeQuiz.css';

export default function TakeQuiz() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});       // local selections
    const [savedAnswers, setSavedAnswers] = useState({}); // confirmed saved
    const [dirty, setDirty] = useState({});            // tracks unsaved changes
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState({});
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);

    // Derived state: check for any unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return Object.values(dirty).some(v => v === true);
    }, [dirty]);

    // Handle back logic with protection
    const handleExit = () => {
        if (hasUnsavedChanges) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi bài thi? Các câu chưa lưu sẽ bị mất.')) {
                navigate('/student/quizzes');
            }
        } else {
            navigate('/student/quizzes');
        }
    };

    // READ: Fetch attempt and questions data
    useEffect(() => {
        const fetchAttemptData = async () => {
            try {
                setLoading(true);
                const attemptData = await apiService.getAttempt(attemptId);
                setAttempt(attemptData);

                // Fetch questions for this quiz
                const questionsData = await apiService.getQuiz(attemptData.quiz);
                const questionList = Array.isArray(questionsData.questions) ? questionsData.questions : [];
                setQuestions(questionList);

                // Initialize answers from existing attempt
                if (attemptData.answers && Array.isArray(attemptData.answers)) {
                    const answerMap = {};
                    attemptData.answers.forEach(ans => {
                        answerMap[ans.question] = ans.selected_choices || [];
                    });
                    setAnswers(answerMap);
                    setSavedAnswers(JSON.parse(JSON.stringify(answerMap)));
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch attempt data:', err);
                setError('Không thể tải dữ liệu bài quiz. Vui lòng kiểm tra lại kết nối.');
                setAttempt(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAttemptData();
    }, [attemptId]);

    // Timer effect
    useEffect(() => {
        if (!attempt || !attempt.finished_at) return;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(attempt.finished_at);
            const diff = end - now;

            if (diff <= 0) {
                // Auto-submit when time is up
                handleSubmitQuiz(true);
            } else {
                setTimeLeft(Math.floor(diff / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [attempt]);

    // FORMAT TIME
    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // UPDATE: Select local choices
    const handleSelectChoice = (questionId, choiceId, isMultiple = false) => {
        let selectedChoices = answers[questionId] || [];
        
        if (isMultiple) {
            if (selectedChoices.includes(choiceId)) {
                selectedChoices = selectedChoices.filter(id => id !== choiceId);
            } else {
                selectedChoices = [...selectedChoices, choiceId];
            }
        } else {
            selectedChoices = [choiceId];
        }

        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedChoices,
        }));

        // Mark as dirty compared to saved state
        const saved = savedAnswers[questionId] || [];
        const isActuallyDifferent = JSON.stringify(selectedChoices.sort()) !== JSON.stringify(saved.sort());
        setDirty(prev => ({ ...prev, [questionId]: isActuallyDifferent }));
        setSaveSuccess(prev => ({ ...prev, [questionId]: false }));
    };

    // SAVE: Persist answer to server
    const handleSaveAnswer = async (questionId) => {
        try {
            setSaving(prev => ({ ...prev, [questionId]: true }));
            setError(null);

            const selectedChoices = answers[questionId] || [];

            await apiService.saveAnswer(attemptId, {
                attempt: attemptId,
                question: questionId,
                selected_choices: selectedChoices,
            });

            // Sync saved state
            setSavedAnswers(prev => ({
                ...prev,
                [questionId]: [...selectedChoices],
            }));
            setDirty(prev => ({ ...prev, [questionId]: false }));
            setSaveSuccess(prev => ({ ...prev, [questionId]: true }));

            setTimeout(() => {
                setSaveSuccess(prev => ({ ...prev, [questionId]: false }));
            }, 3000);
        } catch (err) {
            console.error('Failed to save answer:', err);
            setError('Lỗi khi lưu câu trả lời. Vui lòng thử lại.');
        } finally {
            setSaving(prev => ({ ...prev, [questionId]: false }));
        }
    };

    // SUBMIT: Finalize the exam
    const handleSubmitQuiz = async (isAuto = false) => {
        if (!isAuto) {
            const unsavedCount = Object.values(dirty).filter(v => v).length;
            let msg = 'Bạn xác nhận nộp bài thi? Kết quả sẽ được tính điểm ngay lập tức.';
            if (unsavedCount > 0) {
                msg = `Bạn còn ${unsavedCount} câu chưa lưu. Các thay đổi này sẽ KHÔNG được tính. Vẫn tiếp tục nộp bài?`;
            }
            if (!window.confirm(msg)) return;
        }

        try {
            setSubmitting(true);
            await apiService.submitQuiz(attemptId);
            navigate(`/student/result/${attemptId}`);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setError('Không thể nộp bài. Vui lòng kiểm tra lại kết nối!');
        } finally {
            setSubmitting(false);
        }
    };

    // Progress percentage
    const progress = useMemo(() => {
        if (!questions.length) return 0;
        const answered = questions.filter(q => savedAnswers[q.id]?.length > 0).length;
        return Math.round((answered / questions.length) * 100);
    }, [questions, savedAnswers]);

    if (loading) {
        return (
            <div className="take-quiz-container">
                <div className="stu-loading" style={{ height: '80vh', justifyContent: 'center' }}>
                    <div className="stu-spinner"></div>
                    <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>Đang chuẩn bị bộ đề thi...</p>
                </div>
            </div>
        );
    }

    if (error || !attempt || (questions.length === 0 && !loading)) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-container">
                        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '20px', color: '#1e293b' }}>
                            <h2 style={{ color: '#ef4444' }}>⚠️ {error ? 'Đã xảy ra lỗi' : 'Thông báo'}</h2>
                            <p style={{ margin: '1rem 0 2rem' }}>
                                {error || (!attempt ? 'Không tìm thấy thông tin bài thi.' : 'Bài thi này hiện chưa có câu hỏi nào.')}
                            </p>
                            <button onClick={() => navigate('/student/quizzes')} className="stu-btn-primary">
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    // if (!currentQuestion) return null; // Removed to allow full render logic

    const isMultiple = currentQuestion.type === 'multiple';
    const isCurrentDirty = dirty[currentQuestion.id] || false;
    const isCurrentSaving = saving[currentQuestion.id] || false;
    const isCurrentSaveSuccess = saveSuccess[currentQuestion.id] || false;
    const currentChoices = answers[currentQuestion.id] || [];

    return (
        <div className="take-quiz-container">
            {/* STICKY HEADER */}
            <header className="exam-header">
                <div className="stu-container exam-header-content">
                    <div className="exam-title-section">
                        <button onClick={handleExit} className="exit-btn" title="Thoát khỏi bài thi">
                            <span>✕</span> Thoát
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>
                            {attempt?.quiz_title || 'Bài thi trực tuyến'}
                        </h2>
                    </div>

                    <div className="timer-card">
                        <span style={{ fontSize: '1.4rem' }}>⏱️</span>
                        <span className={timeLeft < 60 ? 'timer-warning' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </header>

            {/* PROGRESS BAR */}
            <div style={{ height: '4px', background: '#e2e8f0', width: '100%' }}>
                <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #6366f1, #22c55e)', 
                    width: `${progress}%`,
                    transition: 'width 0.5s ease-out'
                }}></div>
            </div>

            <main className="stu-container exam-layout">
                {/* SIDEBAR NAVIGATION */}
                <aside className="exam-sidebar animate-in">
                    <div className="sidebar-title">
                        <span>Tiến độ bài làm</span>
                        <span style={{ fontSize: '0.85rem', color: '#6366f1' }}>{progress}%</span>
                    </div>
                    
                    <div className="question-grid">
                        {questions.map((q, idx) => {
                            const isSaved = savedAnswers[q.id]?.length > 0;
                            const isDirtyQ = dirty[q.id] || false;
                            const isActive = currentQuestionIndex === idx;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`q-nav-btn 
                                        ${isActive ? 'active' : ''} 
                                        ${isSaved ? 'saved' : ''} 
                                        ${isDirtyQ ? 'dirty' : ''}`
                                    }
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="status-text status-saved">
                            <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '2px' }}></span>
                            <span>Đã lưu bài</span>
                        </div>
                        <div className="status-text status-dirty">
                            <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></span>
                            <span>Chưa lưu thay đổi</span>
                        </div>
                        <div className="status-text" style={{ color: '#94a3b8' }}>
                            <span style={{ width: '10px', height: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '2px' }}></span>
                            <span>Chưa trả lời</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN QUESTION SECTION */}
                <div className="animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="question-card">
                        <div className="question-type-badge">
                            {isMultiple ? (
                                <><span style={{ fontSize: '1.1rem' }}>☑</span> Câu hỏi nhiều lựa chọn</>
                            ) : (
                                <><span style={{ fontSize: '1.1rem' }}>○</span> Câu hỏi một lựa chọn</>
                            )}
                        </div>

                        <h3 className="question-text">
                            Câu {currentQuestionIndex + 1}: {currentQuestion.content}
                        </h3>

                        <div className="choices-container">
                            {currentQuestion.choices?.map((choice) => {
                                const isSelected = currentChoices.includes(choice.id);
                                return (
                                    <div 
                                        key={choice.id} 
                                        className={`choice-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectChoice(currentQuestion.id, choice.id, isMultiple)}
                                    >
                                        <div className={isMultiple ? 'choice-checkbox' : 'choice-radio'}></div>
                                        <span className="choice-text">{choice.content}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* SAVE SECTION */}
                        <div className="save-action-section">
                            <div>
                                {isCurrentSaveSuccess ? (
                                    <span className="status-text status-saved">✅ Đã lưu vào hệ thống</span>
                                ) : isCurrentDirty ? (
                                    <span className="status-text status-dirty">⚠️ Bạn có thay đổi chưa lưu</span>
                                ) : savedAnswers[currentQuestion.id]?.length > 0 ? (
                                    <span className="status-text status-saved" style={{ opacity: 0.7 }}>✓ Trạng thái: Đã lưu</span>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chưa có câu trả lời</span>
                                )}
                            </div>

                            <button 
                                className="save-btn"
                                onClick={() => handleSaveAnswer(currentQuestion.id)}
                                disabled={isCurrentSaving || !isCurrentDirty}
                            >
                                {isCurrentSaving ? 'Đang đồng bộ...' : 'Lưu câu trả lời'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* BOTTOM ACTION BAR */}
            <footer className="exam-action-bar">
                <div className="stu-container action-bar-content">
                    <div className="nav-group">
                        <button 
                            className="nav-btn"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                            ← Quay lại
                        </button>
                        <button 
                            className="nav-btn"
                            disabled={currentQuestionIndex === questions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        >
                            Tiếp theo →
                        </button>
                    </div>

                    <button 
                        className="submit-btn"
                        onClick={() => handleSubmitQuiz()}
                        disabled={submitting}
                    >
                        {submitting ? 'Đanh nộp bài...' : 'Nộp bài thi'}
                    </button>
                </div>
            </footer>
        </div>
    );
}
