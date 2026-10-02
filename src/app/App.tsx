import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { WelcomePanel } from './components/WelcomePanel';
import { TermsModal } from './components/TermsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { CoursesAuth } from './components/CoursesAuth';
import { CoursesHome } from './components/CoursesHome';
import { VerifyEmail } from './components/VerifyEmail';
import { ResetPassword } from './components/ResetPassword';
import * as StatsAPI from './services/statsApi';
import * as CoursesAPI from './services/coursesApi';

export type Module =
  | 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura'
  | 'fractura' | 'intoxicacion' | 'picadura' | 'descarga' | 'insolacion' | 'convulsion'
  | null;

export default function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => !!StatsAPI.getToken());
  const [isCoursesUser, setIsCoursesUser] = useState(() => !!CoursesAPI.getToken());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = window.location.pathname;
  const urlToken = new URLSearchParams(window.location.search).get('token');

  if (currentPath === '/verify-email' && urlToken) {
    return (
      <VerifyEmail
        token={urlToken}
        onGoToLogin={() => { window.location.href = '/'; }}
      />
    );
  }

  if (currentPath === '/reset-password' && urlToken) {
    return (
      <ResetPassword
        token={urlToken}
        onDone={() => { window.location.href = '/'; }}
      />
    );
  }

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowAdmin(false);
    setShowCourses(false);
    setMobileMenuOpen(false);
  };

  const handleCoursesLogout = () => {
  CoursesAPI.logout();
  setIsCoursesUser(false);
  };

  const handleReset = () => {
    setSelectedModule(null);
  };

  const handleShowAdmin = () => {
    setSelectedModule(null);
    setShowCourses(false);
    setShowAdmin(true);
    setMobileMenuOpen(false);
  };

  const handleShowCourses = () => {
    setSelectedModule(null);
    setShowAdmin(false);
    setShowCourses(true);
    setMobileMenuOpen(false);
  };

  const handleBackToMenu = () => {
    setShowAdmin(false);
    setShowCourses(false);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleCoursesLoginSuccess = () => {
    setIsCoursesUser(true);
  };

  const handleUnauthorized = () => {
    StatsAPI.clearToken();
    setIsAdmin(false);
  };

  const showChat    = !!selectedModule;
  

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0f0f1a]">
      <TermsModal />

      {/* Fondo oscuro detrás del menú lateral, solo en móvil */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 flex-col transition-transform duration-300 ease-in-out md:static md:z-auto md:flex md:translate-x-0 ${
          mobileMenuOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
        }`}
      >
        <Sidebar
          selectedModule={selectedModule}
          onModuleSelect={handleModuleSelect}
          showAdmin={showAdmin}
          onShowAdmin={handleShowAdmin}
          showCourses={showCourses}
          onShowCourses={handleShowCourses}
        />
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden md:m-3 md:rounded-2xl">
        {showChat ? (
          <ChatInterface module={selectedModule} onReset={handleReset} />
        ) : showAdmin ? (
          isAdmin ? (
            <AdminPanel onUnauthorized={handleUnauthorized} onBack={handleBackToMenu} />
          ) : (
            <AdminLogin onSuccess={handleLoginSuccess} onBack={handleBackToMenu} />
          )
        ) : showCourses ? (
          isCoursesUser ? (
            <CoursesHome onBack={handleBackToMenu} onLogout={handleCoursesLogout} />
          ) : (
            <CoursesAuth onSuccess={handleCoursesLoginSuccess} onBack={handleBackToMenu} />
          )
        ) : (
          <WelcomePanel onSelect={handleModuleSelect} onOpenMenu={() => setMobileMenuOpen(true)} />
        )}
      </main>
    </div>
  );
}