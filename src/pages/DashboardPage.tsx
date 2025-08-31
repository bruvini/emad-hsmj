
import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardFilters from '@/components/DashboardFilters';
import DashboardCharts from '@/components/DashboardCharts';
import { FilterState, ChartData, AtendimentoData, UsuarioData } from '@/types/dashboard';
import { format } from 'date-fns';
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

  const [chartData, setChartData] = useState({
    tempoMedioData: [] as ChartData[],
    atendimentosPorMes: [] as ChartData[],
    atendimentosPorDiaSemana: [] as ChartData[],
    atendimentosPorModalidade: [] as ChartData[],
    atendimentosPorProfissional: [] as ChartData[],
    atendimentosPorCargo: [] as ChartData[]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Buscando dados do dashboard com filtros:', filters);
      
      // Construir query do Firestore
      let atendimentosQuery = query(collection(db, 'atendimentosEMAD'));
      
      // Adicionar filtros de data
      if (filters.dateStart) {
        const startTimestamp = Timestamp.fromDate(filters.dateStart);
        atendimentosQuery = query(atendimentosQuery, where('horaInicio', '>=', startTimestamp));
      }
      
      if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        const endTimestamp = Timestamp.fromDate(endDate);
        atendimentosQuery = query(atendimentosQuery, where('horaInicio', '<=', endTimestamp));
      }

      // Adicionar outros filtros se preenchidos
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

      console.log('Dados de atendimentos carregados:', atendimentosData.length);

      // Buscar dados de usuários para filtro por cargo
      const usuariosSnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usuariosData: UsuarioData[] = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto,
        cargo: doc.data().cargo
      }));

      // Aplicar filtro por cargo se necessário
      let filteredAtendimentos = atendimentosData;
      if (filters.cargo) {
        const usuariosComCargo = usuariosData.filter(u => u.cargo === filters.cargo).map(u => u.id);
        filteredAtendimentos = atendimentosData.filter(a => usuariosComCargo.includes(a.profissionalId));
      }

      // Processar dados para os gráficos
      const processedData = processChartData(filteredAtendimentos, usuariosData);
      setChartData(processedData);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (atendimentos: AtendimentoData[], usuarios: UsuarioData[]) => {
    // 1. Tempo Médio de Atendimento por Mês
    const tempoMedioPorMes = new Map<string, { total: number; count: number }>();
    
    // 2. Atendimentos por Mês
    const atendimentosPorMes = new Map<string, number>();
    
    // 3. Atendimentos por Dia da Semana
    const atendimentosPorDiaSemana = new Map<string, number>();
    
    // 4. Atendimentos por Modalidade
    const atendimentosPorModalidade = new Map<string, number>();
    
    // 5. Atendimentos por Profissional
    const atendimentosPorProfissional = new Map<string, number>();
    
    // 6. Atendimentos por Cargo
    const atendimentosPorCargo = new Map<string, number>();

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    atendimentos.forEach(atendimento => {
      if (!atendimento.horaInicio) return;

      const dataInicio = atendimento.horaInicio.toDate();
      const mesAno = format(dataInicio, 'MMM yyyy', { locale: ptBR });
      const diaSemana = diasSemana[dataInicio.getDay()];

      // Processar tempo médio (se houver horaFim)
      if (atendimento.horaFim) {
        const dataFim = atendimento.horaFim.toDate();
        const duracaoMinutos = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60);
        
        const tempoAtual = tempoMedioPorMes.get(mesAno) || { total: 0, count: 0 };
        tempoMedioPorMes.set(mesAno, {
          total: tempoAtual.total + duracaoMinutos,
          count: tempoAtual.count + 1
        });
      }

      // Contar atendimentos por mês
      atendimentosPorMes.set(mesAno, (atendimentosPorMes.get(mesAno) || 0) + 1);
      
      // Contar por dia da semana
      atendimentosPorDiaSemana.set(diaSemana, (atendimentosPorDiaSemana.get(diaSemana) || 0) + 1);
      
      // Contar por modalidade
      const modalidade = atendimento.tipoAtendimento || 'Não informado';
      atendimentosPorModalidade.set(modalidade, (atendimentosPorModalidade.get(modalidade) || 0) + 1);
      
      // Contar por profissional
      const profissionalNome = atendimento.profissionalNome || 'Não informado';
      atendimentosPorProfissional.set(profissionalNome, (atendimentosPorProfissional.get(profissionalNome) || 0) + 1);
      
      // Contar por cargo
      const usuario = usuarios.find(u => u.id === atendimento.profissionalId);
      const cargo = usuario?.cargo || 'Não informado';
      atendimentosPorCargo.set(cargo, (atendimentosPorCargo.get(cargo) || 0) + 1);
    });

    // Converter para formato dos gráficos
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
        .slice(0, 10) // Top 10
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

      <Card>
        <CardHeader>
          <CardTitle>Análise de Produção e Eficiência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DashboardFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={fetchDashboardData}
            onClearFilters={handleClearFilters}
            loading={loading}
          />

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
    </div>
  );
};

export default DashboardPage;
