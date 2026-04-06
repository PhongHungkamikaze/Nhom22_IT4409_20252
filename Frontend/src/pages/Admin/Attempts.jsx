import React from 'react';
import './Attempts.css';
import './Admin.css';

export default function Attempts() {
    return (
        <div className="container admin-attempts">
            <div className="card">
                <h2>Attempts</h2>
                <table className="table">
                    <thead><tr><th>ID</th><th>User</th><th>Quiz</th><th>Score</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        <tr><td>10</td><td>Student A</td><td>Sample Quiz</td><td>8/10</td><td>Completed</td><td>View</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
