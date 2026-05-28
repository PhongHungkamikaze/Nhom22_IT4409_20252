import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { getUserIdFromToken } from '../../utils/jwt';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './TakeQuiz.css';

export default function TakeQuiz() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

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
            let msg = t('student_take_quiz.confirm_submit');
            if (unsavedCount > 0) {
                msg = t('student_take_quiz.unsaved_warning', { count: unsavedCount });
            }
            if (!window.confirm(msg)) return;
        }

        try {
            setSubmitting(true);
            await apiService.request(`/attempts/${attemptId}/submit/`, {
                method: 'POST',
                body: JSON.stringify(submitStatus ? { status: submitStatus } : {}),
            });
            navigate(`/student/result/${attemptId}`);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setError(t('student_take_quiz.submit_error'));
        } finally {
            setSubmitting(false);
        }
    }, [attemptId, dirty, navigate, t]);

    // Real-time cheating detection and Visibility Tracking
    useEffect(() => {
        if (!attemptId) return;

        let isMounted = true;

        // Visibility Change Listener
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                console.warn('SYSTEM: Tab switch detected! Informing system and auto-submitting.');
                setError(t('student_take_quiz.tab_switch'));
                
                // Report violation via REST API
                try {
                    await apiService.request(`/attempts/${attemptId}/report-violation/`, {
                        method: 'POST',
                        body: JSON.stringify({
                            reason: 'Tab switched - Auto submitting',
                        }),
                    });
                } catch (err) {
                    console.error('Failed to report violation:', err);
                }
                
                // Perform auto-submission
                handleSubmitQuiz(true, 'error');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [attemptId, handleSubmitQuiz, t]);

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
                setError(t('student_take_quiz.load_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchAttemptData();
    }, [attemptId, t]);

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
            setError(t('student_take_quiz.save_error'));
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
            if (window.confirm(t('student_take_quiz.exit_unsaved'))) navigate('/student/quizzes');
        } else {
            navigate('/student/quizzes');
        }
    };

    if (loading) return <div className="take-quiz-container"><div className="stu-loading"><div className="stu-spinner"></div><p>{t('student_take_quiz.loading')}</p></div></div>;
    if (error || !attempt) return <div className="student-page"><h2>{error || t('student_take_quiz.error_data')}</h2><button onClick={() => navigate('/student/quizzes')}>{t('student_take_quiz.back')}</button></div>;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="take-quiz-container">
            <header className="exam-header">
                <div className="stu-container exam-header-content">
                    <div className="exam-title-section">
                        <button onClick={handleExit} className="exit-btn">
                            <FiX style={{ marginRight: '6px' }} /> {t('student_take_quiz.exit')}
                        </button>
                        <h2>{attempt?.quiz_title}</h2>
                    </div>
                    <div className="timer-card">
                        <FiClock style={{ color: '#6366f1', fontSize: '1.2rem' }} />
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
                        <span>{t('student_take_quiz.progress')}</span>
                        <span style={{ color: '#6366f1', fontWeight: '800' }}>{progress}%</span>
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
                        <div className="question-type-badge">{currentQuestion.type === 'multiple' ? `☑ ${t('student_take_quiz.multiple_choice')}` : `○ ${t('student_take_quiz.single_choice')}`}</div>
                        <h3 className="question-text">{t('student_take_quiz.question_number', { number: currentQuestionIndex + 1 })} {currentQuestion.content}</h3>
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
                                {saveSuccess[currentQuestion.id] ? (
                                    <span className="status-text status-saved">
                                        <FiCheckCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {t('student_take_quiz.saved')}
                                    </span>
                                ) : dirty[currentQuestion.id] ? (
                                    <span className="status-text status-dirty">
                                        <FiAlertTriangle style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {t('student_take_quiz.unsaved')}
                                    </span>
                                ) : savedAnswers[currentQuestion.id]?.length > 0 ? (
                                    <span className="status-text status-saved" style={{ opacity: 0.7 }}>
                                        <FiCheckCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {t('student_take_quiz.saved')}
                                    </span>
                                ) : ''}
                            </div>
                            <button className="save-btn" disabled={saving[currentQuestion.id] || !dirty[currentQuestion.id]} onClick={() => handleSaveAnswer(currentQuestion.id)}>
                                {saving[currentQuestion.id] ? t('student_take_quiz.saving') : t('student_take_quiz.save_answer')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="exam-action-bar">
                <div className="stu-container action-bar-content">
                    <div className="nav-group">
                        <button className="nav-btn" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(p => p - 1)}>
                            <FiChevronLeft style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {t('student_take_quiz.prev')}
                        </button>
                        <button className="nav-btn" disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                            {t('student_take_quiz.next')} <FiChevronRight style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                        </button>
                    </div>
                    <button className="submit-btn" disabled={submitting} onClick={() => handleSubmitQuiz()}>
                        {submitting ? t('student_take_quiz.submitting') : t('student_take_quiz.submit_quiz')}
                    </button>
                </div>
            </footer>
        </div>
    );
}
