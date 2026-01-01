import React, { useState } from 'react';
import { AppView } from './types';
import { TheAltar } from './components/TheAltar';
import { TheWord } from './components/TheWord';
import { Academy } from './components/Academy';
import { MusicPlayer } from './components/MusicPlayer';
import { Layout, BookOpen, GraduationCap, Cross } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ALTAR);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.ALTAR:
        return <TheAltar />;
      case AppView.WORD:
        return <TheWord />;
      case AppView.ACADEMY:
        return <Academy />;
      default:
        return <TheAltar />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-colors duration-300 ${
        currentView === view
          ? 'bg-neutral-100 text-neutral-900 border-r-4 border-sacred-gold'
          : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="font-sans text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-100 h-screen sticky top-0 bg-white z-50">
        <div className="p-8 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center font-serif font-bold text-xl rounded-sm">A</div>
            <span className="font-serif text-lg tracking-tight">Aposento Alto</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem view={AppView.ALTAR} icon={Layout} label="El Altar" />
          <NavItem view={AppView.WORD} icon={BookOpen} label="La Palabra" />
          <NavItem view={AppView.ACADEMY} icon={GraduationCap} label="Academia" />
        </nav>

        <div className="p-8 text-center text-[10px] text-neutral-300 uppercase tracking-widest">
            Soli Deo Gloria
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-100 sticky top-0 bg-white/95 backdrop-blur z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 text-white flex items-center justify-center font-serif font-bold text-sm rounded-sm">A</div>
            <span className="font-serif text-md">Aposento Alto</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <Cross className="rotate-45" /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-neutral-900"></div><div className="w-4 h-0.5 bg-neutral-900 ml-auto"></div></div>}
          </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 pt-20 md:hidden animate-fade-in">
              <nav className="space-y-2">
                  <NavItem view={AppView.ALTAR} icon={Layout} label="El Altar" />
                  <NavItem view={AppView.WORD} icon={BookOpen} label="La Palabra" />
                  <NavItem view={AppView.ACADEMY} icon={GraduationCap} label="Academia" />
              </nav>
          </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white min-h-screen">
        {renderView()}
      </main>

      {/* Music Widget */}
      <MusicPlayer />
      
      {/* Global CSS adjustments */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;