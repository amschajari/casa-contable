import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/admin/crm/Dashboard';
import Movements from './pages/admin/crm/Movements';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Admin Routes */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <Dashboard />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/movements" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <Movements />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
