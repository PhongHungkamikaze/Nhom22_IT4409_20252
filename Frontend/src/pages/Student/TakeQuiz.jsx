import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';

export default function TakeQuiz() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState({});
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // READ: Fetch attempt and questions data
    useEffect(() => {
        const fetchAttemptData = async () => {
            try {
                setLoading(true);
                const attemptData = await apiService.request(`/attempts/${attemptId}/`);
                setAttempt(attemptData);

                // Fetch questions for this quiz
                const questionsData = await apiService.request(`/quizzes/${attemptData.quiz}/`);
                const questionList = Array.isArray(questionsData.questions) ? questionsData.questions : [];
                setQuestions(questionList);

                // Initialize answers from existing attempt
                if (attemptData.answers && Array.isArray(attemptData.answers)) {
                    const answerMap = {};
                    attemptData.answers.forEach(ans => {
                        answerMap[ans.question] = ans.selected_choices || [];
                    });
                    setAnswers(answerMap);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch attempt data:', err);
                setError('Không thể tải dữ liệu bài quiz');
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
                handleSubmitQuiz();
            } else {
                setTimeLeft(Math.floor(diff / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [attempt, attemptId]);

    // FORMAT TIME
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // UPDATE: Save answer (POST /attempts/{id}/save-answer)
    const handleSelectChoice = async (questionId, choiceId, isMultiple = false) => {
        try {
            setSaving(prev => ({ ...prev, [questionId]: true }));

            let selectedChoices = [];
            if (isMultiple) {
                selectedChoices = answers[questionId] || [];
                if (selectedChoices.includes(choiceId)) {
                    selectedChoices = selectedChoices.filter(id => id !== choiceId);
                } else {
                    selectedChoices = [...selectedChoices, choiceId];
                }
            } else {
                selectedChoices = [choiceId];
            }

            // Save answer to server
            await apiService.request(`/attempts/${attemptId}/save-answer/`, {
                method: 'POST',
                body: JSON.stringify({
                    question: questionId,
                    selected_choices: selectedChoices,
                }),
            });

            // Update local state
            setAnswers(prev => ({
                ...prev,
                [questionId]: selectedChoices,
            }));
        } catch (err) {
            console.error('Failed to save answer:', err);
            setError('Không thể lưu câu trả lời');
        } finally {
            setSaving(prev => ({ ...prev, [questionId]: false }));
        }
    };

    // UPDATE: Submit quiz (POST /attempts/{id}/submit)
    const handleSubmitQuiz = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Không thể quay lại!')) {
            return;
        }

        try {
            setSubmitting(true);
            await apiService.request(`/attempts/${attemptId}/submit/`, {
                method: 'POST',
            });

            // Navigate to results page
            navigate(`/student/result/${attemptId}`);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setError('Không thể nộp bài. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-loading">
                        <div className="stu-spinner"></div>
                        <p>Đang tải bài quiz...</p>
                    </div>
                </section>
            </div>
        );
    }

    if (error || !attempt || questions.length === 0) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-container">
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: '#fee',
                            borderRadius: '8px'
                        }}>
                            <h2>⚠️ {error || 'Không thể tải bài quiz'}</h2>
                            <button
                                onClick={() => navigate('/student/quizzes')}
                                style={{
                                    marginTop: '1rem',
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const questionAnswered = answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;

    return (
        <div className="student-page" style={{ backgroundColor: '#f5f5f5' }}>
            {/* HEADER WITH TIMER */}
            <section style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '1rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div className="stu-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>📝 {attempt.quiz_title || 'Quiz'}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            ⏱️ {timeLeft ? formatTime(timeLeft) : 'Đang tải...'}
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                            Câu {currentQuestionIndex + 1} / {questions.length}
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="stu-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {/* ERROR MESSAGE */}
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

                {/* QUESTIONS - SIDEBAR + CONTENT */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
                    {/* SIDEBAR - QUESTION LIST */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        height: 'fit-content',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Danh sách câu hỏi</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.5rem',
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}>
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: currentQuestionIndex === idx ? '2px solid #007bff' : '1px solid #ccc',
                                        backgroundColor: currentQuestionIndex === idx ? '#e7f1ff' : (answers[q.id]?.length > 0 ? '#e8f5e9' : 'white'),
                                        cursor: 'pointer',
                                        fontWeight: currentQuestionIndex === idx ? 'bold' : 'normal',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {answers[q.id]?.length > 0 ? '✓' : ''} Q{idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT - QUESTION */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {/* QUESTION TEXT */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                marginBottom: '1rem',
                                color: '#333'
                            }}>
                                Câu {currentQuestionIndex + 1}: {currentQuestion.text}
                            </h3>
                        </div>

                        {/* CHOICES */}
                        <div style={{ marginBottom: '2rem' }}>
                            {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
                                <div>
                                    {currentQuestion.choices.map((choice) => (
                                        <div key={choice.id} style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                backgroundColor: answers[currentQuestion.id]?.includes(choice.id) ? '#e7f1ff' : '#f9f9f9',
                                                borderRadius: '6px',
                                                border: answers[currentQuestion.id]?.includes(choice.id) ? '2px solid #007bff' : '1px solid #ddd',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}>
                                                <input
                                                    type={currentQuestion.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                                    name={`question-${currentQuestion.id}`}
                                                    checked={answers[currentQuestion.id]?.includes(choice.id) || false}
                                                    onChange={() => handleSelectChoice(
                                                        currentQuestion.id,
                                                        choice.id,
                                                        currentQuestion.type === 'multiple_choice'
                                                    )}
                                                    disabled={saving[currentQuestion.id]}
                                                    style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <span>{choice.content}</span>
                                                {saving[currentQuestion.id] && (
                                                    <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#007bff' }}>💾...</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                    Không có lựa chọn
                                </div>
                            )}
                        </div>

                        {/* NAVIGATION BUTTONS */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid #eee'
                        }}>
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentQuestionIndex === 0 ? '#ccc' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                ← Câu trước
                            </button>

                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === questions.length - 1}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentQuestionIndex === questions.length - 1 ? '#ccc' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Câu tiếp →
                            </button>

                            <button
                                onClick={handleSubmitQuiz}
                                disabled={submitting}
                                style={{
                                    padding: '10px 30px',
                                    backgroundColor: submitting ? '#ccc' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {submitting ? '⏳ Đang nộp...' : '✓ Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
