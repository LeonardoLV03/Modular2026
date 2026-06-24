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
    <div className="relative min-h-screen overflow-x-hidden bg-[#FBF7F2]">
      {/* Fondo decorativo: ocupa el espacio del viewport en pantallas grandes
          en vez de dejarlo vacío alrededor de una caja angosta */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute top-1/4 -right-32 h-[30rem] w-[30rem] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      {/* Barra de marca: visible solo en la pantalla de selección para que
          el chat conserve su experiencia inmersiva */}
      {!showChat && (
        <header className="relative z-10 flex items-center justify-center gap-3 px-6 pt-10 md:pt-14">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
            <span className="text-base">+</span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Asistente de</p>
            <p className="-mt-0.5 leading-tight text-gray-800">Primeros Auxilios</p>
          </div>
        </header>
      )}

      <main
        className={
          showChat
            ? 'relative z-10 flex min-h-screen justify-center px-0 py-0 md:items-center md:px-6 md:py-12'
            : 'relative z-10 flex justify-center px-5 py-10 md:py-16'
        }
      >
        <div className={showChat ? 'w-full md:max-w-2xl' : 'w-full max-w-5xl'}>
          {!showChat ? (
            <FirstAidKit onModuleSelect={handleModuleSelect} />
          ) : (
            <ChatInterface module={selectedModule} onReset={handleReset} />
          )}
        </div>
      </main>

      {!showChat && (
        <footer className="relative z-10 px-6 pb-10 text-center">
          <p className="text-xs text-gray-400">
            Sistema de apoyo basado en reglas (Prolog) · No sustituye la atención médica profesional
          </p>
        </footer>
      )}
    </div>
  );
}