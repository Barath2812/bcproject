import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
