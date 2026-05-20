import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { getUserIdFromToken } from '../../utils/jwt';
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

    // SUBMIT: Finalize the exam
    const handleSubmitQuiz = useCallback(async (isAuto = false, submitStatus = null) => {
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
            // Call API directly to be 100% sure the body is passed
            await apiService.request(`/attempts/${attemptId}/submit/`, {
                method: 'POST',
                body: JSON.stringify(submitStatus ? { status: submitStatus } : {}),
            });
            navigate(`/student/result/${attemptId}`);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setError('Không thể nộp bài. Vui lòng kiểm tra lại kết nối!');
        } finally {
            setSubmitting(false);
        }
    }, [attemptId, dirty, navigate]);

    // WebSocket: Real-time cheating detection and Visibility Tracking
    useEffect(() => {
        if (!attemptId) return;

        let newSocket = null;
        let isMounted = true;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const accessToken = localStorage.getItem('accessToken');
            const userId = getUserIdFromToken(accessToken) || 'anonymous';

            const wsUrl = `${protocol}//localhost:8000/ws/exam/${attemptId}/${userId}/`;
            newSocket = new WebSocket(wsUrl);

            newSocket.onmessage = (e) => {
                if (!isMounted) return;
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'violation_alert') {
                        console.warn('Violation reported for:', data.user);
                    }
                } catch (err) {
                    console.error('Error parsing WS message:', err);
                }
            };

            newSocket.onclose = (e) => {
                if (isMounted && e.code !== 1000) {
                    setTimeout(connect, 3000);
                }
            };
        };

        connect();

        // Visibility Change Listener (Inside WS effect to use the socket)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.warn('SYSTEM: Tab switch detected! Informing system and auto-submitting.');
                setError('HỆ THỐNG: Phát hiện hành vi chuyển TAB! Bài thi sẽ được nộp tự động ngay lập tức.');
                
                // Send real-time notification
                if (newSocket && newSocket.readyState === WebSocket.OPEN) {
                    newSocket.send(JSON.stringify({
                        type: 'violation',
                        reason: 'Tab switched - Auto submitting',
                    }));
                }
                
                // Perform auto-submission
                handleSubmitQuiz(true, 'error');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            if (newSocket) {
                if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
                    newSocket.close(1000);
                }
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [attemptId, handleSubmitQuiz]);

    // READ: Fetch attempt and questions data
    useEffect(() => {
        const fetchAttemptData = async () => {
            try {
                setLoading(true);
                const attemptData = await apiService.getAttempt(attemptId);
                setAttempt(attemptData);

                const questionsData = await apiService.getQuiz(attemptData.quiz);
                const questionList = Array.isArray(questionsData.questions) ? questionsData.questions : [];
                setQuestions(questionList);

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
                console.error('Failed to fetch:', err);
                setError('Không thể tải bài thi.');
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
                handleSubmitQuiz(true);
            } else {
                setTimeLeft(Math.floor(diff / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [attempt, handleSubmitQuiz]);

    // FORMAT TIME
    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // UPDATE: Select local choices
    const handleSelectChoice = (questionId, choiceId, isMultiple = false) => {
        let selectedChoices = [...(answers[questionId] || [])];
        if (isMultiple) {
            if (selectedChoices.includes(choiceId)) {
                selectedChoices = selectedChoices.filter(id => id !== choiceId);
            } else {
                selectedChoices.push(choiceId);
            }
        } else {
            selectedChoices = [choiceId];
        }
        setAnswers(prev => ({ ...prev, [questionId]: selectedChoices }));

        const saved = savedAnswers[questionId] || [];
        const isActuallyDifferent = JSON.stringify([...selectedChoices].sort()) !== JSON.stringify([...saved].sort());
        setDirty(prev => ({ ...prev, [questionId]: isActuallyDifferent }));
    };

    // SAVE: Persist answer to server
    const handleSaveAnswer = async (questionId) => {
        try {
            setSaving(prev => ({ ...prev, [questionId]: true }));
            const selectedChoices = answers[questionId] || [];
            await apiService.saveAnswer(attemptId, {
                attempt: attemptId,
                question: questionId,
                selected_choices: selectedChoices,
            });
            setSavedAnswers(prev => ({ ...prev, [questionId]: [...selectedChoices] }));
            setDirty(prev => ({ ...prev, [questionId]: false }));
            setSaveSuccess(prev => ({ ...prev, [questionId]: true }));
            setTimeout(() => setSaveSuccess(prev => ({ ...prev, [questionId]: false })), 3000);
        } catch (err) {
            setError('Lỗi khi lưu câu trả lời.');
        } finally {
            setSaving(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const progress = useMemo(() => {
        if (!questions.length) return 0;
        const answered = questions.filter(q => savedAnswers[q.id]?.length > 0).length;
        return Math.round((answered / questions.length) * 100);
    }, [questions, savedAnswers]);

    const handleExit = () => {
        const hasUnsaved = Object.values(dirty).some(v => v);
        if (hasUnsaved) {
            if (window.confirm('Cảnh báo: Bạn có thay đổi chưa lưu. Vẫn thoát?')) navigate('/student/quizzes');
        } else {
            navigate('/student/quizzes');
        }
    };

    if (loading) return <div className="take-quiz-container"><div className="stu-loading"><div className="stu-spinner"></div><p>Đang chuẩn bị đề thi...</p></div></div>;
    if (error || !attempt) return <div className="student-page"><h2>{error || 'Lỗi dữ liệu'}</h2><button onClick={() => navigate('/student/quizzes')}>Quay lại</button></div>;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="take-quiz-container">
            <header className="exam-header">
                <div className="stu-container exam-header-content">
                    <div className="exam-title-section">
                        <button onClick={handleExit} className="exit-btn">✕ Thoát</button>
                        <h2>{attempt?.quiz_title}</h2>
                    </div>
                    <div className="timer-card">
                        <span>⏱️</span>
                        <span className={timeLeft < 60 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <main className="stu-container exam-layout">
                <aside className="exam-sidebar">
                    <div className="sidebar-title">
                        <span>Tiến độ</span>
                        <span style={{ color: '#6366f1' }}>{progress}%</span>
                    </div>
                    <div className="question-grid">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`q-nav-btn ${currentQuestionIndex === idx ? 'active' : ''} ${savedAnswers[q.id]?.length > 0 ? 'saved' : ''} ${dirty[q.id] ? 'dirty' : ''}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="question-card-container">
                    <div className="question-card">
                        <div className="question-type-badge">{currentQuestion.type === 'multiple' ? '☑ Nhiều lựa chọn' : '○ Một lựa chọn'}</div>
                        <h3 className="question-text">Câu {currentQuestionIndex + 1}: {currentQuestion.content}</h3>
                        <div className="choices-container">
                            {currentQuestion.choices?.map(choice => (
                                <div
                                    key={choice.id}
                                    className={`choice-option ${answers[currentQuestion.id]?.includes(choice.id) ? 'selected' : ''}`}
                                    onClick={() => handleSelectChoice(currentQuestion.id, choice.id, currentQuestion.type === 'multiple')}
                                >
                                    <div className={currentQuestion.type === 'multiple' ? 'choice-checkbox' : 'choice-radio'}></div>
                                    <span className="choice-text">{choice.content}</span>
                                </div>
                            ))}
                        </div>
                        <div className="save-action-section">
                            <div>
                                {saveSuccess[currentQuestion.id] ? <span className="status-text status-saved">✅ Đã lưu</span> :
                                    dirty[currentQuestion.id] ? <span className="status-text status-dirty">⚠️ Chưa lưu</span> :
                                        savedAnswers[currentQuestion.id]?.length > 0 ? <span className="status-text status-saved" style={{ opacity: 0.7 }}>✓ Đã lưu</span> : ''}
                            </div>
                            <button className="save-btn" disabled={saving[currentQuestion.id] || !dirty[currentQuestion.id]} onClick={() => handleSaveAnswer(currentQuestion.id)}>
                                {saving[currentQuestion.id] ? 'Đang lưu...' : 'Lưu câu trả lời'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="exam-action-bar">
                <div className="stu-container action-bar-content">
                    <div className="nav-group">
                        <button className="nav-btn" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(p => p - 1)}>← Quay lại</button>
                        <button className="nav-btn" disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex(p => p + 1)}>Tiếp theo →</button>
                    </div>
                    <button className="submit-btn" disabled={submitting} onClick={() => handleSubmitQuiz()}>
                        {submitting ? 'Đang nộp...' : 'Nộp bài thi'}
                    </button>
                </div>
            </footer>
        </div>
    );
}
