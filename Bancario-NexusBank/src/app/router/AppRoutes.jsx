import { Route, Routes } from 'react-router-dom';
import Home from '../../features/main/Home.jsx';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute.jsx';
import { ClientDashboardLayout } from '../../shared/components/layout/ClientDashboardLayout.jsx';
import { ClientDashboard } from '../../features/client/pages/ClientDashboard.jsx';
import ClientProfileSettingsView from '../../features/client/pages/ClientProfileSettingsView.jsx';
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx';
import { VerificationPage } from '../../features/auth/pages/VerificationPage.jsx';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import AdminDashboardContainer from '../../shared/components/layout/AdminDashboardContainer.jsx';
import PendingDepositRequestsView from '../../shared/components/layout/PendingDepositRequestsView.jsx';
import AdminProfileSettingsView from '../../shared/components/layout/AdminProfileSettingsView.jsx';
import { Deposits } from '../../features/client/pages/Deposits.jsx';
import { Transfers } from '../../features/client/pages/Transfers.jsx';
import Favorites from '../../features/client/pages/Favorites.jsx';
import Accounts from '../../features/client/pages/Accounts.jsx';
import AccountHistory from '../../features/client/pages/AccountHistory.jsx';
import PendingRequestsView from '../../shared/components/layout/PendingRequestsView.jsx';
import EmployeDashnoardContainer from '../../shared/components/layout/EmployeDashnoardContainer.jsx';
import EmployeeProfileSettingsView from '../../shared/components/layout/EmployeeProfileSettingsView.jsx';
import AdminEmployeesView from '../../shared/components/layout/AdminEmployeesView.jsx';
import PromotionsManagementView from '../../shared/components/layout/PromotionsManagementView.jsx';
import AccountRequestsHistoryView from '../../shared/components/layout/AccountRequestsHistoryView.jsx';
import ClientNotificationsView from '../../shared/components/layout/ClientNotificationsView.jsx';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerificationPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ── Cliente ── */}
            <Route
                path="/clientdashboard"
                element={
                    <ProtectedRoute excludeRole="Empleado">
                        <ClientDashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<ClientDashboard />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="account-history" element={<AccountHistory />} />
                <Route path="notifications" element={<ClientNotificationsView />} />
                <Route path="profile-settings" element={<ClientProfileSettingsView />} />
                <Route path="deposits" element={<Deposits />} />
                <Route path="transfers" element={<Transfers />} />
                <Route path="favorites" element={<Favorites />} />
            </Route>

            {/* ── Admin ── */}
            <Route
                path="/AdminDashboard"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <AdminDashboardContainer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/AdminDashboard/profile-settings"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <AdminProfileSettingsView />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/AdminDashboard/employees"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <AdminEmployeesView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/AdminDashboard/requests"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <PendingRequestsView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/AdminDashboard/promotions"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <PromotionsManagementView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/AdminDashboard/account-requests-history"
                element={
                    <ProtectedRoute requiredRole="Admin">
                        <AccountRequestsHistoryView />
                    </ProtectedRoute>
                }
            />

            {/* ── Empleado ── */}
            <Route
                path="/EmployeeDashboard"
                element={
                    <ProtectedRoute requiredRole="Empleado">
                        <EmployeDashnoardContainer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/EmployeeDashboard/deposits"
                element={
                    <ProtectedRoute requiredRole="Empleado">
                        <EmployeDashnoardContainer />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/EmployeeDashboard/profile-settings"
                element={
                    <ProtectedRoute requiredRole="Empleado">
                        <EmployeeProfileSettingsView />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}