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
  };

  const handleShowCourses = () => {
    setSelectedModule(null);
    setShowAdmin(false);
    setShowCourses(true);
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
  const showWelcome = !selectedModule && !showAdmin && !showCourses;
  const showDetail  = showChat || showAdmin || showCourses;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      <TermsModal />
      <aside
        className={`${
          showDetail ? 'hidden md:flex' : 'flex'
        } w-full md:w-72 flex-shrink-0 flex-col`}
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

      <main
        className={`${
          showWelcome ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col overflow-hidden md:m-3 md:rounded-2xl`}
      >
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
          <WelcomePanel onSelect={handleModuleSelect} />
        )}
      </main>
    </div>
  );
}