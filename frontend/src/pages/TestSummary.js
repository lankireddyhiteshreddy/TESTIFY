import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './TestSummary.css';

function TestSummary() {
    const { test_id } = useParams();
    const [test, setTest] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await axiosInstance.get(`/tests/getTest/${test_id}`);
                setTest(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTest();
    }, [test_id]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage("Please select a Question Paper PDF.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", selectedFile);
        formData.append("test_id", test_id);

        try {
            setUploading(true);
            setMessage("");
            
            const res = await axiosInstance.post("/test/upload", formData);
            const parsedQuestions = res.data.parsed; // <-- matches your back-end!

            if (!parsedQuestions?.length) {
            setMessage("No valid questions extracted.");
            return;
            }

            for (const q of parsedQuestions) {
            const qForm = new FormData();
            qForm.append("test_id", test_id);
            qForm.append("question_text", q.questionText);
            qForm.append("marks", 1);
            qForm.append("negative_marks", 0);

            // no image for now
            if (q.image) {
                const blob = await (await fetch(q.image)).blob();
                qForm.append("image", blob, "question.png");
            }

            const optionsArray = q.options.map(opt => ({
                option_text: opt,
                is_correct: opt === q.correctOption ? 1 : 0
            }));
            qForm.append("options", JSON.stringify(optionsArray));

            await axiosInstance.post("/questions/createQuestion", qForm, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            }

            await axiosInstance.put(`/tests/mark-complete/${test_id}`);

            setMessage("Questions extracted and saved to DB successfully!");
            navigate(`/tests/${test_id}/summary`, { state: { is_complete: true } });
            navigate('/tests');

        } catch (err) {
            console.error(err);
            setMessage("Failed to upload or save questions.");
        } finally {
            setUploading(false);
        }
        };


    const handleAddQuestions = () => {  
        navigate(`/tests/${test_id}/add-questions`);
    };

    const handleFinalizeLater = () => {
        navigate('/'); 
    };

    if (!test) return <p>Loading test details...</p>;

    return (
        <div className="summary-container">
            <div className="summary-wrapper">
                <h2>Test Summary</h2>
                <div className="summary-details">
                    <p><span>Title:</span> <span>{test.title}</span></p>
                    <p><span>Description:</span> <span>{test.description || 'No description provided'}</span></p>
                    <p><span>Duration:</span> <span>{test.test_duration} mins</span></p>
                    <p><span>Public:</span> <span>{test.is_public ? 'Yes' : 'No'}</span></p>
                    <p><span>Questions:</span> <span>(None added yet)</span></p>
                </div>

                <div className="summary-upload">
                    <h3>Upload Question Paper (PDF)</h3>
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Question Paper"}
                    </button>
                    {message && <p className="message">{message}</p>}
                </div>

                <button className="action-btn" onClick={handleAddQuestions}>
                    ➕ Add Questions Manually
                </button>
                <button className="action-btn" onClick={handleFinalizeLater}>
                    ✅ Finalize Later
                </button>
            </div>
        </div>
    );
}

export default TestSummary;
