
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardCharts } from '@/components/DashboardCharts';
import { format, getMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  patientId?: string;
  professionalId?: string;
  cargo?: string;
  modalidade?: string;
  nivelAtencao?: string;
}

interface ChartData {
  tempoMedio: Array<{ month: string; tempo: number }>;
  atendimentosPorMes: Array<{ month: string; total: number }>;
  atendimentosPorDia: Array<{ dia: string; total: number }>;
  atendimentosPorModalidade: Array<{ modalidade: string; total: number }>;
  atendimentosPorProfissional: Array<{ profissional: string; total: number }>;
  atendimentosPorCargo: Array<{ cargo: string; total: number }>;
}

const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({
    tempoMedio: [],
    atendimentosPorMes: [],
    atendimentosPorDia: [],
    atendimentosPorModalidade: [],
    atendimentosPorProfissional: [],
    atendimentosPorCargo: []
  });

  // Opções para os filtros
  const [patientOptions, setPatientOptions] = useState<FilterOption[]>([]);
  const [professionalOptions, setProfessionalOptions] = useState<FilterOption[]>([]);
  const [cargoOptions, setCargoOptions] = useState<FilterOption[]>([]);

  // Carregar opções dos filtros
  const loadFilterOptions = useCallback(async () => {
    try {
      // Carregar pacientes
      const patientsQuery = query(collection(db, 'pacientesEMAD'), orderBy('nomeCompleto'));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients = patientsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().nomeCompleto
      }));
      setPatientOptions(patients);

      // Carregar profissionais
      const professionalsQuery = query(collection(db, 'usuariosEMAD'), orderBy('nomeCompleto'));
      const professionalsSnapshot = await getDocs(professionalsQuery);
      const professionals = professionalsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().nomeCompleto
      }));
      setProfessionalOptions(professionals);

      // Extrair cargos únicos
      const cargos = [...new Set(professionalsSnapshot.docs.map(doc => doc.data().cargo))];
      const cargoOpts = cargos.map(cargo => ({ value: cargo, label: cargo }));
      setCargoOptions(cargoOpts);

    } catch (error) {
      console.error('Erro ao carregar opções dos filtros:', error);
      toast.error('Erro ao carregar opções dos filtros');
    }
  }, []);

  // Função para buscar e processar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Construir query dinâmica baseada nos filtros
      let atendimentosQuery = query(collection(db, 'atendimentosEMAD'));
      
      const constraints = [];

      if (filters.startDate) {
        constraints.push(where('horaInicio', '>=', Timestamp.fromDate(filters.startDate)));
      }
      
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        constraints.push(where('horaInicio', '<=', Timestamp.fromDate(endOfDay)));
      }

      if (filters.patientId) {
        constraints.push(where('pacienteId', '==', filters.patientId));
      }

      if (filters.professionalId) {
        constraints.push(where('profissionalId', '==', filters.professionalId));
      }

      if (filters.modalidade) {
        constraints.push(where('tipoAtendimento', '==', filters.modalidade));
      }

      if (constraints.length > 0) {
        atendimentosQuery = query(collection(db, 'atendimentosEMAD'), ...constraints);
      }

      const querySnapshot = await getDocs(atendimentosQuery);
      const atendimentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[Dashboard] ${atendimentos.length} atendimentos encontrados`);

      // Buscar dados dos profissionais para combinar com cargos
      const professionalsSnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const professionalsMap = new Map();
      professionalsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        professionalsMap.set(doc.id, {
          nome: data.nomeCompleto,
          cargo: data.cargo
        });
      });

      // Processar dados para os gráficos
      const processedData = processChartData(atendimentos, professionalsMap);
      setChartData(processedData);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Função para processar dados dos gráficos
  const processChartData = (atendimientos: any[], professionalsMap: Map<string, any>): ChartData => {
    // 1. Tempo médio por mês
    const tempoMedioPorMes = new Map<string, { total: number; count: number; tempo: number }>();
    
    // 2. Atendimentos por mês
    const atendimentosPorMes = new Map<string, number>();
    
    // 3. Atendimentos por dia da semana
    const atendimentosPorDia = new Map<string, number>();
    
    // 4. Atendimentos por modalidade
    const atendimentosPorModalidade = new Map<string, number>();
    
    // 5. Atendimentos por profissional
    const atendimentosPorProfissional = new Map<string, number>();
    
    // 6. Atendimentos por cargo
    const atendimentosPorCargo = new Map<string, number>();

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    atendimientos.forEach(atendimento => {
      if (!atendimento.horaInicio) return;

      const inicio = atendimento.horaInicio.toDate();
      const fim = atendimento.horaFim?.toDate();
      
      const monthKey = meses[getMonth(inicio)];
      const dayKey = diasSemana[getDay(inicio)];

      // Tempo médio por mês
      if (fim) {
        const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60); // minutos
        const current = tempoMedioPorMes.get(monthKey) || { total: 0, count: 0, tempo: 0 };
        current.total += duracao;
        current.count += 1;
        current.tempo = current.total / current.count;
        tempoMedioPorMes.set(monthKey, current);
      }

      // Atendimentos por mês
      atendimentosPorMes.set(monthKey, (atendimentosPorMes.get(monthKey) || 0) + 1);

      // Atendimentos por dia da semana
      atendimentosPorDia.set(dayKey, (atendimentosPorDia.get(dayKey) || 0) + 1);

      // Atendimentos por modalidade
      const modalidade = atendimento.tipoAtendimento || 'Não informado';
      atendimentosPorModalidade.set(modalidade, (atendimentosPorModalidade.get(modalidade) || 0) + 1);

      // Atendimentos por profissional
      const profissionalNome = atendimento.profissionalNome || 'Não informado';
      atendimentosPorProfissional.set(profissionalNome, (atendimentosPorProfissional.get(profissionalNome) || 0) + 1);

      // Atendimentos por cargo
      const professional = professionalsMap.get(atendimento.profissionalId);
      const cargo = professional?.cargo || 'Não informado';
      atendimentosPorCargo.set(cargo, (atendimentosPorCargo.get(cargo) || 0) + 1);
    });

    return {
      tempoMedio: Array.from(tempoMedioPorMes.entries()).map(([month, data]) => ({
        month,
        tempo: Math.round(data.tempo * 100) / 100
      })),
      atendimentosPorMes: Array.from(atendimentosPorMes.entries()).map(([month, total]) => ({
        month,
        total
      })),
      atendimentosPorDia: Array.from(atendimentosPorDia.entries()).map(([dia, total]) => ({
        dia,
        total
      })),
      atendimentosPorModalidade: Array.from(atendimentosPorModalidade.entries()).map(([modalidade, total]) => ({
        modalidade,
        total
      })),
      atendimentosPorProfissional: Array.from(atendimentosPorProfissional.entries())
        .map(([profissional, total]) => ({ profissional, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10), // Top 10
      atendimentosPorCargo: Array.from(atendimentosPorCargo.entries()).map(([cargo, total]) => ({
        cargo,
        total
      }))
    };
  };

  // Carregar opções dos filtros ao montar o componente
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setFilters({});
    // Dados serão recarregados automaticamente devido ao useEffect
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Estratégico</h1>
          <p className="text-muted-foreground">Análise de dados e métricas do sistema</p>
        </div>
      </div>

      {/* Bloco de Análise de Produção e Eficiência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Análise de Produção e Eficiência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <DashboardFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            loading={loading}
            patientOptions={patientOptions}
            professionalOptions={professionalOptions}
            cargoOptions={cargoOptions}
          />

          {/* Gráficos */}
          <DashboardCharts data={chartData} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
