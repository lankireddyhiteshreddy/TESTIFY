import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './TestCreate.css';

function TestCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { test_id } = useParams();

    const editing = Boolean(test_id); 
    const existingTest = location.state?.test; 

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [isKey, setIsKey] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (editing && existingTest) {
            setTitle(existingTest.title || '');
            setDescription(existingTest.description || '');
            setDuration(existingTest.test_duration || '');
            setIsKey(existingTest.answer_key_uploaded === 1);
        }
    }, [editing, existingTest]);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');

        const payload = {
            title,
            description,
            test_duration: parseInt(duration),
            answer_key_uploaded: isKey ? 1 : 0
        };

        try {
            if (editing) {
                await axiosInstance.put(`/tests/editTest/${test_id}`, payload);
                alert("Test updated successfully!");
                navigate('/tests');
            } else {
                const response = await axiosInstance.post('/tests/createTest', payload);
                const newTestId = response.data?.test?.test_id;
                if (newTestId) {
                    navigate(`/tests/${newTestId}/summary`);
                } else {
                    setMessage(response.data?.message || "Error creating test.");
                }
            }
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
        }
    }

    const handleHomeClick = () => navigate('/');

    return (
        <div className="test-create-container">
            <nav className="navbar">
                <span>ABOUT</span>
                <span onClick={handleHomeClick}>HOME</span>
            </nav>

            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="form-layout">
                    <h2>{editing ? "Edit Test" : "Create New Test"}</h2>
                    <div className="form-row">
                        <label>TEST TITLE :</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" required />
                    </div>
                    <div className="form-row">
                        <label>TEST DESCRIPTION :</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="description" />
                    </div>
                    <div className="form-row">
                        <label>SET DURATION OF YOUR TEST :</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="in min" min="1" required />
                    </div>
                    <div className="form-row-checkbox">
                        <label>UPLOAD KEY BEFORE COMPLETION?</label>
                        <input type="checkbox" checked={isKey} onChange={(e) => setIsKey(e.target.checked)} />
                    </div>
                    <button type="submit" className="create-btn">
                        {editing ? "Update Test" : "Create Test"}
                    </button>
                    {message && <p className="error-message">{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default TestCreate;
