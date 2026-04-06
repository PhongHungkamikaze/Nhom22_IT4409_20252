import React from 'react';
import './Quizzes.css';
import './Admin.css';

export default function Quizzes() {
    return (
        <div className="container admin-quizzes">
            <div className="card">
                <h2>Quizzes</h2>
                <table className="table">
                    <thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Visibility</th><th>Actions</th></tr></thead>
                    <tbody>
                        <tr><td>2</td><td>Sample Quiz</td><td>Teacher 1</td><td>Public</td><td>Edit | Delete</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
