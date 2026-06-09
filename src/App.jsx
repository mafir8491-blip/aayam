import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';

// Placeholder Pages (to be implemented page-by-page)
import Home from './pages/Home';
import Team from './pages/Team';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventSubEvents from './pages/EventSubEvents';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import ReachOut from './pages/ReachOut';
import Gallery from './pages/Gallery';
import AuthPortal from './pages/AuthPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import EventEdit from './pages/EventEdit';

// Helper component to conditionally wrap pages with global layout (Navbar/Footer)
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-fill">{children}</main>
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar/Footer Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/team" element={<Layout><Team /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
        <Route path="/events/:eventId/register" element={<Layout><EventSubEvents /></Layout>} />
        <Route path="/register/:subEventId" element={<Layout><Register /></Layout>} />
        <Route path="/register/:subEventId/success" element={<Layout><RegisterSuccess /></Layout>} />
        <Route path="/reachout" element={<Layout><ReachOut /></Layout>} />
        <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
        
        {/* Auth Route (standalone, no layout) */}
        <Route path="/auth" element={<AuthPortal />} />
        
        {/* Admin Routes (nested or separate layouts) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/subevents/:id/registrations" element={<AdminRegistrations />} />
        <Route path="/events/edit/:id" element={<Layout><EventEdit /></Layout>} />
        
        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Lightbox />
    </Router>
  );
}

