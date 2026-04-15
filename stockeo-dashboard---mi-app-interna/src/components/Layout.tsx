import React, { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, X, Sun, Moon, Calendar as CalendarIcon, Package, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'catalog' | 'calendar';
  setActiveTab: (tab: 'dashboard' | 'catalog' | 'calendar') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('stockeo_authorized');
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo', icon: Package },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-40 shadow-xl shadow-slate-200/50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Stockeo</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Admin Interno</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl h-12"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl h-12"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <ShoppingBag className="text-white w-5 h-5" />
          </div>
          <span className="font-black tracking-tighter uppercase text-slate-900 dark:text-white">Stockeo</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Liquid Glass Bottom Navbar (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-[2.5rem] p-2 flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                activeTab === item.id ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <AnimatePresence>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              <item.icon className={`w-6 h-6 relative z-10 ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-bold mt-1 relative z-10 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="lg:ml-72 p-6 lg:p-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
