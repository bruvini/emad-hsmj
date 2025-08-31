
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  tempoMedio: Array<{ month: string; tempo: number }>;
  atendimentosPorMes: Array<{ month: string; total: number }>;
  atendimentosPorDia: Array<{ dia: string; total: number }>;
  atendimentosPorModalidade: Array<{ modalidade: string; total: number }>;
  atendimentosPorProfissional: Array<{ profissional: string; total: number }>;
  atendimentosPorCargo: Array<{ cargo: string; total: number }>;
}

interface DashboardChartsProps {
  data: ChartData;
  loading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

const chartConfig = {
  tempo: { label: "Tempo Médio", color: "hsl(var(--chart-1))" },
  total: { label: "Total", color: "hsl(var(--chart-2))" },
  modalidade: { label: "Modalidade", color: "hsl(var(--chart-3))" },
  profissional: { label: "Profissional", color: "hsl(var(--chart-4))" },
  cargo: { label: "Cargo", color: "hsl(var(--chart-5))" },
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Carregando gráfico...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tempo Médio de Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>Tempo Médio por Atendimento (minutos)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={data.tempoMedio}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="tempo" 
                stroke="var(--color-tempo)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-tempo)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Atendimentos por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Total de Atendimentos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={data.atendimentosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Atendimentos por Dia da Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={data.atendimentosPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Atendimentos por Modalidade */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos por Modalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <PieChart>
              <Pie
                data={data.atendimentosPorModalidade}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ modalidade, percent }) => `${modalidade} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {data.atendimentosPorModalidade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Atendimentos por Profissional */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Nº de Atendimentos por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart layout="horizontal" data={data.atendimentosPorProfissional}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="profissional" type="category" width={150} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-profissional)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Atendimentos por Cargo */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Nº de Atendimentos por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart layout="horizontal" data={data.atendimentosPorCargo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="cargo" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-cargo)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
