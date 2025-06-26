import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './QuestionCreate.css';

function QuestionCreate() {
    const { test_id } = useParams();
    const navigate = useNavigate();
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [image, setImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false); 

    useEffect(() => {
        const stored = localStorage.getItem(`questions_${test_id}`);
        const existing = stored ? JSON.parse(stored) : [];
        const usedNumbers = new Set(existing.map(q => Number(q.questionNumber)));
        let newQuestionNumber = 1;
        while (usedNumbers.has(newQuestionNumber)) {
            newQuestionNumber++;
        }
        setQuestionNumber(newQuestionNumber);
    }, [test_id]);

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddQuestion = () => {
        const trimmedText = questionText.trim();
        if (trimmedText === '') {
            alert('Question text cannot be empty!');
            return;
        }

        const validOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');
        if (validOptions.length < 2) {
            alert('Please provide at least two options.');
            return;
        }

        const newQuestion = {
            questionNumber: questionNumber,
            questionText: trimmedText,
            options: validOptions,
            image: image || '',
        };

        const stored = localStorage.getItem(`questions_${test_id}`);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [...existing, newQuestion];
        localStorage.setItem(`questions_${test_id}`, JSON.stringify(updated));

        const usedNumbers = new Set(updated.map(q => Number(q.questionNumber)));
        let newQuestionNumber = 1;
        while (usedNumbers.has(newQuestionNumber)) {
            newQuestionNumber++;
        }

        setQuestionNumber(newQuestionNumber);
        setQuestionText('');
        setOptions(['', '', '', '']);
        setImage(null);
        setShowPreview(false);
    };

    const handleGoToSummary = () => navigate(`/tests/${test_id}/questions-summary`);
    const handleDone = () => navigate('/');

    return (
        <div className="container">
            <nav className="navbar">
                <span>ABOUT</span>
                <span onClick={handleDone}>HOME</span>
            </nav>

            <div className="form-wrapper">
                <label className="label">QUESTION NUMBER :</label>
                <input
                    type="number"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(Number(e.target.value))}
                    className="input-field"
                />

                <label className="label">QUESTION TEXT :</label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="input-field"
                    placeholder="Type question here"
                />

                <label htmlFor="image-upload" className="upload-button">ADD IMAGE</label>
                <input
                    type="file"
                    id="image-upload"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                />

                {image && (
                    <>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Preview:</strong><br />
                            <img
                                src={image}
                                alt="preview"
                                className="preview-image"
                                onClick={() => setShowPreview(true)}
                            />
                        </div>

                        {showPreview && (
                            <div className="image-overlay" onClick={() => setShowPreview(false)}>
                                <img
                                    src={image}
                                    alt="Full Preview"
                                    className="full-image"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </>
                )}

                <label className="label">OPTIONS :</label>
                <div className="option-inputs">
                    {options.map((opt, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`option_${idx + 1}`}
                            className="input-field"
                        />
                    ))}
                </div>

                <button type="button" className="gray-button" onClick={handleAddOption}>
                    ADD OPTION
                </button>

                <button type="button" className="submit-button" onClick={handleAddQuestion}>
                    ADD QUESTION
                </button>

                <button type="button" className="submit-button" onClick={handleGoToSummary}>
                    VIEW SUMMARY
                </button>
            </div>
        </div>
    );
}

export default QuestionCreate;
