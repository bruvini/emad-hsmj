
import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import DashboardFilters from '@/components/DashboardFilters';
import DashboardCharts from '@/components/DashboardCharts';
import PatientProfileCharts from '@/components/PatientProfileCharts';
import { FilterState, ChartData, AtendimentoData, UsuarioData, PacienteData } from '@/types/dashboard';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateStart: undefined,
    dateEnd: undefined,
    pacienteId: '',
    profissionalId: '',
    cargo: '',
    modalidadeAtendimento: '',
    nivelAtencao: ''
  });

  // Estados para os gráficos de produção e eficiência
  const [chartData, setChartData] = useState({
    tempoMedioData: [] as ChartData[],
    atendimentosPorMes: [] as ChartData[],
    atendimentosPorDiaSemana: [] as ChartData[],
    atendimentosPorModalidade: [] as ChartData[],
    atendimentosPorProfissional: [] as ChartData[],
    atendimentosPorCargo: [] as ChartData[]
  });

  // Estados para os gráficos de perfil dos pacientes
  const [patientData, setPatientData] = useState({
    tipoCuidadoCards: [] as { tipo: string; count: number }[],
    pacientesPorNivel: [] as ChartData[],
    piramideEtaria: [] as { faixa: string; masculino: number; feminino: number }[],
    pacientesPorStatus: [] as ChartData[]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Buscando dados do dashboard com filtros:', filters);
      
      // Buscar dados de atendimentos
      let atendimentosQuery = query(collection(db, 'atendimentosEMAD'));
      
      // Adicionar filtros de data
      if (filters.dateStart) {
        const startTimestamp = Timestamp.fromDate(filters.dateStart);
        atendimentosQuery = query(atendimentosQuery, where('horaInicio', '>=', startTimestamp));
      }
      
      if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        endDate.setHours(23, 59, 59, 999);
        const endTimestamp = Timestamp.fromDate(endDate);
        atendimentosQuery = query(atendimentosQuery, where('horaInicio', '<=', endTimestamp));
      }

      // Adicionar outros filtros de atendimento
      if (filters.pacienteId) {
        atendimentosQuery = query(atendimentosQuery, where('pacienteId', '==', filters.pacienteId));
      }
      
      if (filters.profissionalId) {
        atendimentosQuery = query(atendimentosQuery, where('profissionalId', '==', filters.profissionalId));
      }
      
      if (filters.modalidadeAtendimento) {
        atendimentosQuery = query(atendimentosQuery, where('tipoAtendimento', '==', filters.modalidadeAtendimento));
      }
      
      if (filters.nivelAtencao) {
        atendimentosQuery = query(atendimentosQuery, where('nivelAtencao', '==', filters.nivelAtencao));
      }

      const atendimentosSnapshot = await getDocs(atendimentosQuery);
      const atendimentosData: AtendimentoData[] = atendimentosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AtendimentoData));

      // Buscar dados de usuários
      const usuariosSnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usuariosData: UsuarioData[] = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto,
        cargo: doc.data().cargo
      }));

      // Buscar dados de pacientes
      let pacientesQuery = query(collection(db, 'pacientesEMAD'));
      
      // Aplicar filtros aos pacientes
      if (filters.pacienteId) {
        pacientesQuery = query(pacientesQuery, where('__name__', '==', filters.pacienteId));
      }
      
      if (filters.nivelAtencao) {
        pacientesQuery = query(pacientesQuery, where('nivelAtencao', '==', filters.nivelAtencao));
      }

      const pacientesSnapshot = await getDocs(pacientesQuery);
      const pacientesData: PacienteData[] = pacientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PacienteData));

      // Aplicar filtro por cargo nos atendimentos
      let filteredAtendimentos = atendimentosData;
      if (filters.cargo) {
        const usuariosComCargo = usuariosData.filter(u => u.cargo === filters.cargo).map(u => u.id);
        filteredAtendimentos = atendimentosData.filter(a => usuariosComCargo.includes(a.profissionalId));
      }

      // Processar dados para os gráficos de produção
      const processedChartData = processChartData(filteredAtendimentos, usuariosData);
      setChartData(processedChartData);

      // Processar dados para os gráficos de perfil dos pacientes
      const processedPatientData = processPatientData(pacientesData);
      setPatientData(processedPatientData);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (atendimentos: AtendimentoData[], usuarios: UsuarioData[]) => {
    // 1. Tempo Médio de Atendimento por Mês
    const tempoMedioPorMes = new Map<string, { total: number; count: number }>();
    const atendimentosPorMes = new Map<string, number>();
    const atendimentosPorDiaSemana = new Map<string, number>();
    const atendimentosPorModalidade = new Map<string, number>();
    const atendimentosPorProfissional = new Map<string, number>();
    const atendimentosPorCargo = new Map<string, number>();

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    atendimentos.forEach(atendimento => {
      if (!atendimento.horaInicio) return;

      const dataInicio = atendimento.horaInicio.toDate();
      const mesAno = format(dataInicio, 'MMM yyyy', { locale: ptBR });
      const diaSemana = diasSemana[dataInicio.getDay()];

      if (atendimento.horaFim) {
        const dataFim = atendimento.horaFim.toDate();
        const duracaoMinutos = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60);
        
        const tempoAtual = tempoMedioPorMes.get(mesAno) || { total: 0, count: 0 };
        tempoMedioPorMes.set(mesAno, {
          total: tempoAtual.total + duracaoMinutos,
          count: tempoAtual.count + 1
        });
      }

      atendimentosPorMes.set(mesAno, (atendimentosPorMes.get(mesAno) || 0) + 1);
      atendimentosPorDiaSemana.set(diaSemana, (atendimentosPorDiaSemana.get(diaSemana) || 0) + 1);
      
      const modalidade = atendimento.tipoAtendimento || 'Não informado';
      atendimentosPorModalidade.set(modalidade, (atendimentosPorModalidade.get(modalidade) || 0) + 1);
      
      const profissionalNome = atendimento.profissionalNome || 'Não informado';
      atendimentosPorProfissional.set(profissionalNome, (atendimentosPorProfissional.get(profissionalNome) || 0) + 1);
      
      const usuario = usuarios.find(u => u.id === atendimento.profissionalId);
      const cargo = usuario?.cargo || 'Não informado';
      atendimentosPorCargo.set(cargo, (atendimentosPorCargo.get(cargo) || 0) + 1);
    });

    return {
      tempoMedioData: Array.from(tempoMedioPorMes.entries()).map(([name, data]) => ({
        name,
        value: Math.round(data.total / data.count)
      })),
      
      atendimentosPorMes: Array.from(atendimentosPorMes.entries()).map(([name, value]) => ({
        name,
        value
      })),
      
      atendimentosPorDiaSemana: diasSemana.map(dia => ({
        name: dia,
        value: atendimentosPorDiaSemana.get(dia) || 0
      })),
      
      atendimentosPorModalidade: Array.from(atendimentosPorModalidade.entries()).map(([name, value]) => ({
        name,
        value
      })),
      
      atendimentosPorProfissional: Array.from(atendimentosPorProfissional.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          value
        })),
      
      atendimentosPorCargo: Array.from(atendimentosPorCargo.entries()).map(([name, value]) => ({
        name,
        value
      }))
    };
  };

  const processPatientData = (pacientes: PacienteData[]) => {
    // Processar tipos de cuidado
    const tipoCuidadoCount = new Map<string, number>();
    const nivelAtencaoCount = new Map<string, number>();
    const statusCount = new Map<string, number>();
    const piramideEtariaData = new Map<string, { masculino: number; feminino: number }>();

    pacientes.forEach(paciente => {
      // Tipos de cuidado
      if (paciente.tipoCuidado && Array.isArray(paciente.tipoCuidado)) {
        paciente.tipoCuidado.forEach(tipo => {
          tipoCuidadoCount.set(tipo, (tipoCuidadoCount.get(tipo) || 0) + 1);
        });
      }

      // Nível de atenção
      if (paciente.nivelAtencao) {
        nivelAtencaoCount.set(paciente.nivelAtencao, (nivelAtencaoCount.get(paciente.nivelAtencao) || 0) + 1);
      }

      // Status
      if (paciente.status) {
        statusCount.set(paciente.status, (statusCount.get(paciente.status) || 0) + 1);
      }

      // Pirâmide etária
      if (paciente.dataNascimento && paciente.sexo) {
        const idade = differenceInYears(new Date(), paciente.dataNascimento.toDate());
        const faixaEtaria = Math.floor(idade / 10) * 10;
        const faixaLabel = `${faixaEtaria}-${faixaEtaria + 9}`;
        
        const faixaData = piramideEtariaData.get(faixaLabel) || { masculino: 0, feminino: 0 };
        
        if (paciente.sexo === 'Masculino') {
          faixaData.masculino += 1;
        } else if (paciente.sexo === 'Feminino') {
          faixaData.feminino += 1;
        }
        
        piramideEtariaData.set(faixaLabel, faixaData);
      }
    });

    return {
      tipoCuidadoCards: Array.from(tipoCuidadoCount.entries()).map(([tipo, count]) => ({
        tipo,
        count
      })),
      
      pacientesPorNivel: Array.from(nivelAtencaoCount.entries()).map(([name, value]) => ({
        name,
        value
      })),
      
      piramideEtaria: Array.from(piramideEtariaData.entries())
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([faixa, data]) => ({
          faixa,
          masculino: -data.masculino, // Valores negativos para criar efeito de pirâmide
          feminino: data.feminino
        })),
      
      pacientesPorStatus: Array.from(statusCount.entries()).map(([name, value]) => ({
        name,
        value
      }))
    };
  };

  const handleClearFilters = () => {
    setFilters({
      dateStart: undefined,
      dateEnd: undefined,
      pacienteId: '',
      profissionalId: '',
      cargo: '',
      modalidadeAtendimento: '',
      nivelAtencao: ''
    });
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Estratégico</h1>
      </div>

      {/* Painel de Filtros Global */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={fetchDashboardData}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {/* Accordion com os Blocos de Análise */}
      <Accordion type="single" collapsible className="space-y-4">
        {/* Bloco 1: Análise de Produção e Eficiência */}
        <AccordionItem value="producao-eficiencia">
          <AccordionTrigger className="text-xl font-semibold">
            Análise de Produção e Eficiência
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                {!loading && (
                  <DashboardCharts
                    tempoMedioData={chartData.tempoMedioData}
                    atendimentosPorMes={chartData.atendimentosPorMes}
                    atendimentosPorDiaSemana={chartData.atendimentosPorDiaSemana}
                    atendimentosPorModalidade={chartData.atendimentosPorModalidade}
                    atendimentosPorProfissional={chartData.atendimentosPorProfissional}
                    atendimentosPorCargo={chartData.atendimentosPorCargo}
                  />
                )}

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando dados do dashboard...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Bloco 2: Perfil dos Pacientes */}
        <AccordionItem value="perfil-pacientes">
          <AccordionTrigger className="text-xl font-semibold">
            Perfil dos Pacientes
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                {!loading && (
                  <PatientProfileCharts
                    tipoCuidadoCards={patientData.tipoCuidadoCards}
                    pacientesPorNivel={patientData.pacientesPorNivel}
                    piramideEtaria={patientData.piramideEtaria}
                    pacientesPorStatus={patientData.pacientesPorStatus}
                  />
                )}

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando dados do dashboard...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DashboardPage;
