import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { WelcomePanel } from './components/WelcomePanel';

export type Module = 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura' | null;

export default function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
  };

  const handleReset = () => {
    setSelectedModule(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Sidebar: full screen en móvil si no hay módulo, 288px fija en desktop */}
      <aside
        className={`${
          selectedModule ? 'hidden md:flex' : 'flex'
        } w-full md:w-72 flex-shrink-0 flex-col`}
      >
        <Sidebar selectedModule={selectedModule} onModuleSelect={handleModuleSelect} />
      </aside>

      {/* Panel principal: oculto en móvil si no hay módulo */}
      <main
        className={`${
          !selectedModule ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col overflow-hidden md:m-3 md:rounded-2xl`}
      >
        {selectedModule ? (
          <ChatInterface module={selectedModule} onReset={handleReset} />
        ) : (
          <WelcomePanel />
        )}
      </main>
    </div>
  );
}