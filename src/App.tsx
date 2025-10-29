import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { About } from './pages/About';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Meeting } from './pages/Meeting';
import { Toaster } from 'react-hot-toast';

// Create a wrapper component to handle layout logic
const AppContent = () => {
  const location = useLocation();
  const isMeetingRoom = location.pathname.startsWith('/meeting/');

  const content = (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/meeting/:meetingId" element={<Meeting />} />
        </Routes>
      </main>
    </div>
  );

  return isMeetingRoom ? content : <Layout>{content}</Layout>;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-center" />
      <AppContent />
    </Router>
  );
}

export default App;