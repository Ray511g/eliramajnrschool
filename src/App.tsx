import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider } from './context/SchoolContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Exams from './pages/Exams';
import Timetable from './pages/Timetable';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import Results from './pages/Results';
import Communication from './pages/Communication';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="grades" element={<Grades />} />
        <Route path="exams" element={<Exams />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="fees" element={<Fees />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<Reports />} />
        <Route path="communication" element={<Communication />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <AppRoutes />
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
