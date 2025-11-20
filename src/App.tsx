import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { LoginPage } from '@/pages/auth/login-page';
import { AppLayout } from '@/components/layout/app-layout';
import { EventsPage } from '@/pages/events/events-page';
import { ParticipantsPage } from '@/pages/participants/participants-page';
import { PartnersPage } from '@/pages/cms/partners-page';
import { AlbumsPage } from '@/pages/cms/albums-page';
import { AlbumDetailPage } from '@/pages/cms/album-detail-page';
import { AchievementsPage } from '@/pages/gamification/achievements-page';
import { NotulenListPage } from '@/pages/communication/notulen/notulen-list-page';
import { NotulenDetailPage } from '@/pages/communication/notulen/notulen-detail-page';
import { EmailDashboardPage } from '@/pages/communication/email/email-dashboard-page';
import { VideosPage } from '@/pages/cms/videos-page';
import { RadioRecordingsPage } from '@/pages/cms/radio-recordings-page';
import ChatPage from '@/pages/communication/chat/chat-page';
import { UsersPage } from '@/pages/users/users-page';
import { RolesPage } from '@/pages/rbac/roles-page';
import { PermissionsPage } from '@/pages/rbac/permissions-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';

// --- De Hoofd Applicatie ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* -- Publieke Routes -- */}
          <Route path="/auth/login" element={<LoginPage />} />

          {/* -- Beveiligde Routes -- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              
              {/* Redirect root naar dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* EVENTS MODULE */}
              <Route path="events" element={<EventsPage />} />

              {/* PARTICIPANTS MODULE */}
              <Route path="participants" element={
                <PermissionGuard resource="participant" action="read">
                  <ParticipantsPage />
                </PermissionGuard>
              } />

              {/* USERS MODULE */}
              <Route path="users" element={<UsersPage />} />

              {/* GAMIFICATION MODULE */}
              <Route path="gamification" element={
                <PermissionGuard resource="gamification" action="read">
                  <AchievementsPage />
                </PermissionGuard>
              } />

              {/* CMS MODULE */}
              <Route path="cms/partners" element={
                <PermissionGuard resource="cms" action="read">
                  <PartnersPage />
                </PermissionGuard>
              } />
              <Route path="cms/albums" element={
                <PermissionGuard resource="cms" action="read">
                  <AlbumsPage />
                </PermissionGuard>
              } />
              <Route path="cms/albums/:albumId" element={
                <PermissionGuard resource="cms" action="read">
                  <AlbumDetailPage />
                </PermissionGuard>
              } />
              <Route path="cms/videos" element={<VideosPage />} />
              <Route path="cms/radio" element={<RadioRecordingsPage />} />
              <Route path="cms" element={<div>CMS Module (Coming Soon)</div>} />

              {/* COMMUNICATION MODULE */}
              <Route path="communication" element={<Navigate to="/communication/email" replace />} />
              <Route path="communication/notulen" element={<NotulenListPage />} />
              <Route path="communication/notulen/:id" element={<NotulenDetailPage />} />
              <Route path="communication/chat" element={<ChatPage />} />
              <Route path="communication/email" element={<EmailDashboardPage />} />

              <Route path="settings" element={<div>Instellingen (Coming Soon)</div>} />
              <Route path="rbac/roles" element={<RolesPage />} />
              <Route path="rbac/permissions" element={<PermissionsPage />} />
              
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;