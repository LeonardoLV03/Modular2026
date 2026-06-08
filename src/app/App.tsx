import { useState } from 'react';
import { FirstAidKit } from './components/FirstAidKit';
import { ChatInterface } from './components/ChatInterface';

export type Module = 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura' | null;

export default function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [showChat, setShowChat] = useState(false);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowChat(true);
  };

  const handleReset = () => {
    setSelectedModule(null);
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {!showChat ? (
          <FirstAidKit onModuleSelect={handleModuleSelect} />
        ) : (
          <ChatInterface module={selectedModule} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
