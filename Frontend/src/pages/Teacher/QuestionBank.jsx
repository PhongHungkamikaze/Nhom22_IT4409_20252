import React, { useState } from 'react';
import './Teacher.css';
import '../Admin/Admin.css'; // Reuse common layout styles
import '../Admin/Users.css'; // Reuse table styles

export default function QuestionBank() {
    const [searchTerm, setSearchTerm] = useState('');

    const [questions] = useState([
        { id: 1, point: 1, text: 'What is the Virtual DOM in React?', type: 'Multiple Choice', difficulty: 'Medium', topic: 'React.js' },
        { id: 2, point: 2, text: 'Explain the CSS Box Model.', type: 'Essay', difficulty: 'Hard', topic: 'CSS' },
        { id: 3, point: 1, text: 'Which tag is used for hyperlinking in HTML?', type: 'Multiple Choice', difficulty: 'Easy', topic: 'HTML' },
        { id: 4, point: 1, text: 'What does "use strict" do in Javascript?', type: 'Multiple Choice', difficulty: 'Medium', topic: 'JavaScript' },
        { id: 5, point: 2, text: 'Write a Node.js script to read a file.', type: 'Essay', difficulty: 'Hard', topic: 'Node.js' },
    ]);

    const filteredQuestions = questions.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Bank</h1>
                    <p className="admin-subtitle">Organize and manage the repository of your exam questions.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">📝</span> Add Question
                </button>
            </header>

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search keywords or topics..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option value="all">All Topics</option>
                            <option value="react">React.js</option>
                            <option value="css">CSS</option>
                            <option value="html">HTML</option>
                            <option value="js">JavaScript</option>
                        </select>
                        <select className="filter-select">
                            <option value="all">Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Question Prompt</th>
                                <th>Topic</th>
                                <th>Type</th>
                                <th>Level & Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>
                                        <div className="question-text">
                                            {q.text}
                                        </div>
                                    </td>
                                    <td><span className="topic-badge">{q.topic}</span></td>
                                    <td>{q.type}</td>
                                    <td>
                                        <div className="diff-cell">
                                            <span className={`diff-badge diff-${q.difficulty.toLowerCase()}`}>
                                                {q.difficulty}
                                            </span>
                                            <span className="point-badge">{q.point} pt</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only edit-btn" title="Edit Question">✏️</button>
                                            <button className="btn-icon-only delete-btn" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
