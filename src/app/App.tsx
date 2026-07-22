import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { WelcomePanel } from './components/WelcomePanel';
import { StatsPanel } from './components/StatsPanel';

export type Module =
  | 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura'
  | 'fractura' | 'intoxicacion' | 'picadura' | 'descarga' | 'insolacion' | 'convulsion'
  | null;

export default function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [showStats, setShowStats] = useState(false);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowStats(false);
  };

  const handleReset = () => {
    setSelectedModule(null);
  };

  const handleShowStats = () => {
    setSelectedModule(null);
    setShowStats(true);
  };

  const showChat    = !!selectedModule;
  const showWelcome = !selectedModule && !showStats;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      <aside
        className={`${
          showChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-72 flex-shrink-0 flex-col`}
      >
        <Sidebar
          selectedModule={selectedModule}
          onModuleSelect={handleModuleSelect}
          showStats={showStats}
          onShowStats={handleShowStats}
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
          <StatsPanel />
        ) : (
          <WelcomePanel />
        )}
      </main>
    </div>
  );
}