import React from 'react';
import './Questions.css';
import './Admin.css';

export default function Questions() {
    return (
        <div className="container admin-questions">
            <div className="card">
                <h2>Questions</h2>
                <table className="table">
                    <thead><tr><th>ID</th><th>Text</th><th>Type</th><th>Points</th><th>Actions</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>What is 2+2?</td><td>MCQ</td><td>1</td><td>Edit</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
