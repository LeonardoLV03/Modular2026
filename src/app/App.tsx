import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { WelcomePanel } from './components/WelcomePanel';
import { TermsModal } from './components/TermsModal';
import { StatsPanel } from './components/StatsPanel';
import { AdminLogin } from './components/AdminLogin';
import { CoursesAuth } from './components/CoursesAuth';
import { CoursesHome } from './components/CoursesHome';
import * as StatsAPI from './services/statsApi';
import * as CoursesAPI from './services/coursesApi';

export type Module =
  | 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura'
  | 'fractura' | 'intoxicacion' | 'picadura' | 'descarga' | 'insolacion' | 'convulsion'
  | null;

export default function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [showStats, setShowStats] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => !!StatsAPI.getToken());
  const [isCoursesUser, setIsCoursesUser] = useState(() => !!CoursesAPI.getToken());

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowStats(false);
    setShowCourses(false);
  };

  const handleCoursesLogout = () => {
  CoursesAPI.logout();
  setIsCoursesUser(false);
  };

  const handleReset = () => {
    setSelectedModule(null);
  };

  const handleShowStats = () => {
    setSelectedModule(null);
    setShowCourses(false);
    setShowStats(true);
  };

  const handleShowCourses = () => {
    setSelectedModule(null);
    setShowStats(false);
    setShowCourses(true);
  };

  const handleBackToMenu = () => {
    setShowStats(false);
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
  const showWelcome = !selectedModule && !showStats && !showCourses;
  const showDetail  = showChat || showStats || showCourses;

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
          showStats={showStats}
          onShowStats={handleShowStats}
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
        ) : showStats ? (
          isAdmin ? (
            <StatsPanel onUnauthorized={handleUnauthorized} onBack={handleBackToMenu} />
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
          <WelcomePanel />
        )}
      </main>
    </div>
  );
}