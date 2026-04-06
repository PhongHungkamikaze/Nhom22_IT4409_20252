import React from 'react';
import './Student.css';

export default function QuizList() {
    return (
        <div className="container student-quizlist">
            <div className="card">
                <h2>Available Quizzes</h2>
                <div className="quiz-grid">
                    <div className="quiz-card">Sample Quiz 1</div>
                    <div className="quiz-card">Sample Quiz 2</div>
                </div>
            </div>
        </div>
    );
}
