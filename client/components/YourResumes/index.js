import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL;

const ScoreRing = ({ score }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div className="score-ring-wrapper">
            <svg width="130" height="130" viewBox="0 0 130 130">
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6c63ff" />
                        <stop offset="100%" stopColor="#48b1f3" />
                    </linearGradient>
                </defs>
                <circle className="score-ring-bg" cx="65" cy="65" r={r} />
                <circle
                    className="score-ring-fill"
                    cx="65"
                    cy="65"
                    r={r}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                />
                <text
                    x="65"
                    y="65"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="22"
                    fontWeight="700"
                    transform="rotate(90 65 65)"
                >
                    {score}%
                </text>
            </svg>
            <p className="score-ring-label">
                <strong>Compatibility Score</strong>
            </p>
        </div>
    );
};

const YourResumes = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setError("");
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
            setError("");
        } else {
            setError("Only PDF files are supported.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleUploadAndAnalyze = async () => {
        if (!selectedFile) {
            setError("Please select a resume to upload.");
            return;
        }

        if (!jobDescription.trim()) {
            setError("Please paste a job description.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("You must be logged in.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", selectedFile);

        try {
            setLoading(true);
            setError("");

            // STEP 1: Upload Resume
            const uploadResponse = await fetch(`${API_URL}/resume/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(errorText || "Resume upload failed.");
            }

            const data = await uploadResponse.json();

            // STEP 2: Analyze Resume (after successful upload)
            const rawData = {
                resumeText: data.text,
                jobDescription,
            };

            const analyzeResponse = await fetch(`${API_URL}/resume/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(rawData),
            });

            if (!analyzeResponse.ok) {
                const errorText = await analyzeResponse.text();
                throw new Error(errorText || "Resume analysis failed.");
            }
            const analyzeData = await analyzeResponse.json();
            setAnalysisResult(analyzeData);
            setShowModal(true);

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-page">
            {/* Top Bar */}
            <div className="resume-topbar">
                <div className="brand">
                    <span className="brand-icon">🎯</span>
                    <span>ATS Analyser</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            {/* Upload Card */}
            <div className="resume-container">
                <h2>Upload Your Resume</h2>

                {/* Drag & Drop Zone */}
                <label
                    className="drop-zone"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <span className="drop-icon">📄</span>
                    <span className="drop-text">
                        Drag & drop your PDF here, or click to browse
                    </span>
                    {selectedFile && (
                        <span className="drop-file-name">✓ {selectedFile.name}</span>
                    )}
                </label>

                <textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                />

                <button className="analyze-btn" onClick={handleUploadAndAnalyze} disabled={loading}>
                    {loading ? "Processing..." : "Upload & Analyze"}
                </button>

                {error && <p className="error">{error}</p>}
            </div>

            {/* Results Modal */}
            {showModal && analysisResult?.success && (() => {
                const report =
                    analysisResult.suggestions?.analysis ??
                    analysisResult.suggestions ??
                    analysisResult;

                const score = report?.compatibility_score ?? analysisResult.score ?? 0;

                return (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>ATS Resume Analysis Report</h2>

                            {/* Score Ring */}
                            <ScoreRing score={Number(score)} />

                            {/* Resume Skills */}
                            <h3>✅ Resume Skills</h3>
                            <div className="chip-group">
                                {report?.resume_skills?.map((skill, i) => (
                                    <span key={i} className="chip chip-green">{skill}</span>
                                ))}
                            </div>

                            {/* Job Description Skills */}
                            <h3>📋 Job Description Skills</h3>
                            <div className="chip-group">
                                {report?.job_description_skills?.map((skill, i) => (
                                    <span key={i} className="chip chip-green">{skill}</span>
                                ))}
                            </div>

                            {/* Missing Skills */}
                            <h3>❌ Missing Skills (Add to Resume)</h3>
                            <div className="chip-group">
                                {report?.missing_skills?.from_resume_for_job_description?.map((skill, i) => (
                                    <span key={i} className="chip chip-red">{skill}</span>
                                ))}
                            </div>

                            {/* Extra Skills */}
                            <h3>🟡 Extra Skills (Not Required by Job)</h3>
                            <div className="chip-group">
                                {report?.missing_skills?.from_job_description_for_resume?.map((skill, i) => (
                                    <span key={i} className="chip chip-yellow">{skill}</span>
                                ))}
                            </div>

                            {/* ATS Optimization Tips */}
                            <h3>💡 ATS Optimization Tips</h3>
                            <ul>
                                {report?.ats_optimization_tips?.map((tip, i) => (
                                    <li key={i}>{tip.replace(/\*\*/g, "")}</li>
                                ))}
                            </ul>

                            {/* Bullet Improvements */}
                            <h3>✏️ Bullet Point Improvements</h3>
                            {report?.ats_optimized_bullet_point_improvements?.map((item, i) => (
                                <div key={i} className="bullet-card">
                                    <p><strong>Original:</strong> {item.original_summary}</p>
                                    <p><strong>Reasoning:</strong> {item.reasoning}</p>
                                    <strong>Suggested Bullets:</strong>
                                    <ul>
                                        {item.suggested_bullets?.map((bullet, j) => (
                                            <li key={j}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Overall Assessment */}
                            <h3>📝 Overall Assessment</h3>
                            <p className="overall-text">{report?.overall_assessment}</p>

                            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default YourResumes;
