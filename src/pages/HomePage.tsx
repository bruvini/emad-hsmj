
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BedDouble, 
  Stethoscope, 
  LayoutDashboard,
  Activity,
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const DashboardCard = ({ title, icon: Icon, to, description }) => (
  <Link 
    to={to}
    className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:scale-105 transform transition-all duration-200 hover:shadow-md"
  >
    <div className="flex items-center mb-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="text-blue-600" size={24} />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </Link>
);

const HomePage = () => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral - EMAD HMSJ</h1>
      <p className="text-gray-600">Bem-vindo(a) ao sistema de gestão da Equipe Multi de Atendimento Domiciliar</p>
    </div>

    {/* Indicadores Rápidos */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
            <p className="text-2xl font-bold text-gray-900">42</p>
          </div>
          <Activity className="text-blue-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Atendimentos no Mês</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
          <Calendar className="text-green-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Novas Admissões</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <TrendingUp className="text-blue-600" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Alertas</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <AlertCircle className="text-yellow-600" size={24} />
        </div>
      </div>
    </div>

    {/* Alertas */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recentes</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600 text-center">Nenhum alerta novo</p>
      </div>
    </div>

    {/* Grid de Navegação */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Gestão de Usuários"
          icon={Users}
          description="Gerenciar usuários do sistema"
          to="/gestao-usuarios"
        />
        <DashboardCard
          title="Gerenciar Pacientes"
          icon={BedDouble}
          description="Cadastro e acompanhamento"
          to="/pacientes"
        />
        <DashboardCard
          title="Lançar Atendimentos"
          icon={Stethoscope}
          description="Registrar atendimentos"
          to="/atendimentos"
        />
        <DashboardCard
          title="Dashboard Estratégico"
          icon={LayoutDashboard}
          description="Relatórios e indicadores"
          to="/dashboard"
        />
      </div>
    </div>
  </div>
);

export default HomePage;
