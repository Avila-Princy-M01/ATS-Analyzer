import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import YourResumes from './components/YourResumes';

function App() {
    const token = localStorage.getItem("token");

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={token ? <YourResumes /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
