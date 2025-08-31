
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, BarChart3, Timer } from 'lucide-react';

interface Atendimento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  horaInicio: any;
  horaFim: any;
  status: string;
}

interface AtendimentosMetricsProps {
  atendimentos: Atendimento[];
}

const AtendimentosMetrics: React.FC<AtendimentosMetricsProps> = ({ atendimentos }) => {
  const atendimentosConcluidos = atendimentos.filter(a => a.status === 'Concluído');

  const calculateMetrics = () => {
    if (atendimentosConcluidos.length === 0) {
      return {
        totalAtendimentos: 0,
        mediaPorPaciente: 0,
        tempoMedioAtendimento: 0,
        tempoTotalAtendimento: 0
      };
    }

    // Quantidade total de atendimentos
    const totalAtendimentos = atendimentosConcluidos.length;

    // Pacientes únicos
    const pacientesUnicos = new Set(atendimentosConcluidos.map(a => a.pacienteId));
    const numeroPacientesUnicos = pacientesUnicos.size;

    // Média por paciente
    const mediaPorPaciente = numeroPacientesUnicos > 0 ? totalAtendimentos / numeroPacientesUnicos : 0;

    // Calcular durações dos atendimentos
    const duracoes: number[] = [];
    let tempoTotalMinutos = 0;

    atendimentosConcluidos.forEach(atendimento => {
      if (atendimento.horaInicio && atendimento.horaFim) {
        const inicio = atendimento.horaInicio.toDate();
        const fim = atendimento.horaFim.toDate();
        const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);
        
        if (duracaoMinutos > 0) {
          duracoes.push(duracaoMinutos);
          tempoTotalMinutos += duracaoMinutos;
        }
      }
    });

    // Tempo médio de atendimento
    const tempoMedioAtendimento = duracoes.length > 0 
      ? duracoes.reduce((acc, curr) => acc + curr, 0) / duracoes.length 
      : 0;

    return {
      totalAtendimentos,
      mediaPorPaciente,
      tempoMedioAtendimento,
      tempoTotalAtendimento: tempoTotalMinutos
    };
  };

  const formatTempo = (minutos: number) => {
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = Math.round(minutos % 60);
    
    if (horas < 24) {
      return `${horas}h ${minutosRestantes}min`;
    }
    
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    return `${dias}d ${horasRestantes}h ${minutosRestantes}min`;
  };

  const formatTempoTotal = (minutos: number) => {
    if (minutos < 60) {
      return `${Math.round(minutos)} minutos`;
    }
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = Math.round(minutos % 60);
    
    if (horas < 24) {
      return `${horas} horas e ${minutosRestantes} minutos`;
    }
    
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (dias === 1) {
      return `${dias} dia, ${horasRestantes} horas e ${minutosRestantes} minutos`;
    }
    
    return `${dias} dias, ${horasRestantes} horas e ${minutosRestantes} minutos`;
  };

  const metrics = calculateMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quantidade de Atendimentos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalAtendimentos}</div>
          <p className="text-xs text-muted-foreground">
            Atendimentos concluídos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Paciente</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.mediaPorPaciente.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Atendimentos por paciente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTempo(metrics.tempoMedioAtendimento)}</div>
          <p className="text-xs text-muted-foreground">
            Duração média por atendimento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{formatTempoTotal(metrics.tempoTotalAtendimento)}</div>
          <p className="text-xs text-muted-foreground">
            Tempo total em atendimento
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtendimentosMetrics;
