
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BedDouble, 
  Stethoscope, 
  LayoutDashboard,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    {/* Card de Boas-vindas */}
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Heart className="text-white" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl text-blue-900 mb-2">
            Bem-vindo ao EMAD Care Nexus
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
            Esta ferramenta foi desenvolvida para otimizar a gestão e o registro dos atendimentos domiciliares, 
            centralizando informações de pacientes e facilitando a rotina da equipe EMAD para um cuidado mais 
            eficiente e humanizado. Nosso objetivo é proporcionar melhor qualidade de vida aos pacientes e 
            suas famílias, através de um atendimento domiciliar integrado e de excelência.
          </p>
          <div className="flex justify-center items-center mt-6 gap-8">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield size={20} />
              <span className="font-medium">Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Heart size={20} />
              <span className="font-medium">Humanizado</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <TrendingUp size={20} />
              <span className="font-medium">Eficiente</span>
            </div>
          </div>
        </CardContent>
      </Card>
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
