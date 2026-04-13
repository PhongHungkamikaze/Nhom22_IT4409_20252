import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './Attempts.css';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Attempts() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiService.getAttempts();
                setAttempts(Array.isArray(data.results) ? data.results : data);
            } catch (err) {
                console.error('Failed to fetch attempts', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
            
    return (
        <div className="container admin-attempts">
            <QuickSystem />

            <div className="card">
                <h2>Attempts</h2>
                <table className="table">
                    <thead><tr><th>ID</th><th>User</th><th>Quiz</th><th>Score</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : attempts.length > 0 ? (
                            attempts.map(attempt => (
                                <tr key={attempt.id}>
                                    <td>{attempt.id}</td>
                                    <td>{attempt.user?.username || attempt.user}</td>
                                    <td>{attempt.quiz?.title || attempt.quiz}</td>
                                    <td>{attempt.score ?? '-'}</td>
                                    <td>{attempt.status}</td>
                                </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">No attempts found</td></tr>
                            )}
                        {/* <tr><td>10</td><td>Student A</td><td>Sample Quiz</td><td>8/10</td><td>Completed</td><td>View</td></tr> */}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
