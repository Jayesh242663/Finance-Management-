import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/layout/ScrollToTop';

// Route-level code splitting
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const StudentList = lazy(() => import('./pages/students/StudentList'));
const StudentForm = lazy(() => import('./pages/students/StudentForm'));
const StudentDetail = lazy(() => import('./pages/students/StudentDetail'));
const FeesPage = lazy(() => import('./pages/fees/FeesPage'));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AuditPage = lazy(() => import('./pages/audit/AuditPage'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <StudentProvider>
          <Suspense fallback={<div style={{padding:'2rem', color:'#fff'}}>Loading...</div>}>
            <Routes>
              {/* All routes inside MainLayout directly */}
              <Route
                path="/dashboard"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />
              
              <Route
                path="/students"
                element={
                  <MainLayout>
                    <StudentList />
                  </MainLayout>
                }
              />
              
              <Route
                path="/students/new"
                element={
                  <MainLayout>
                    <StudentForm />
                  </MainLayout>
                }
              />
              
              <Route
                path="/students/:id"
                element={
                  <MainLayout>
                    <StudentDetail />
                  </MainLayout>
                }
              />
              
              <Route
                path="/students/:id/edit"
                element={
                  <MainLayout>
                    <StudentForm />
                  </MainLayout>
                }
              />
              
              <Route
                path="/fees"
                element={
                  <MainLayout>
                    <FeesPage />
                  </MainLayout>
                }
              />
              
              <Route
                path="/expenses"
                element={
                  <MainLayout>
                    <ExpensesPage />
                  </MainLayout>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                }
              />


              <Route
                path="/audit"
                element={
                  <MainLayout>
                    <AuditPage />
                  </MainLayout>
                }
              />


              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </StudentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
