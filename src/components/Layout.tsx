
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BedDouble, 
  Stethoscope, 
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ currentPage, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard, path: '/' },
    { id: 'users', label: 'Gestão de Usuários', icon: Users, path: '/gestao-usuarios' },
    { id: 'patients', label: 'Gerenciar Pacientes', icon: BedDouble, path: '/pacientes' },
    { id: 'appointments', label: 'Lançar Atendimentos', icon: Stethoscope, path: '/atendimentos' },
    { id: 'dashboard', label: 'Dashboard Estratégico', icon: TrendingUp, path: '/dashboard' }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-600">EMAD</h2>
                <p className="text-sm text-gray-600">Hospital São José</p>
              </div>
              <button 
                onClick={onToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentPage === item.path 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-700 hover:bg-gray-100">
              <LogOut size={20} className="mr-3" />
              <span>Sair</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onToggleSidebar }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sistema EMAD - HMSJ</h1>
          <p className="text-sm text-gray-600">Equipe Multi de Atendimento Domiciliar</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">Dr. João Silva</p>
          <p className="text-xs text-gray-600">Coordenador EMAD</p>
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">JS</span>
        </div>
      </div>
    </div>
  </header>
);

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          currentPage={location.pathname}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
