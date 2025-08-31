
import React from 'react';
import {
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientProfileChartsProps {
  tipoCuidadoCards: { tipo: string; count: number }[];
  pacientesPorNivel: { name: string; value: number }[];
  piramideEtaria: { faixa: string; masculino: number; feminino: number }[];
  pacientesPorStatus: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Tooltip customizado para a pirâmide etária
const PyramidTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{`Faixa: ${label} anos`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.dataKey === 'masculino' ? 'Masculino' : 'Feminino'}: {Math.abs(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PatientProfileCharts({
  tipoCuidadoCards,
  pacientesPorNivel,
  piramideEtaria,
  pacientesPorStatus
}: PatientProfileChartsProps) {
  return (
    <div className="space-y-6">
      {/* Cards por Tipo de Cuidado */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pacientes por Tipo de Cuidado</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tipoCuidadoCards.map((item, index) => (
            <Card key={item.tipo}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {item.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {item.tipo}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes por Nível de Atenção */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Nível de Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pacientesPorNivel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pirâmide Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Pirâmide Etária de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={piramideEtaria} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="faixa" type="category" width={60} />
                <Tooltip content={<PyramidTooltip />} />
                <Legend />
                <Bar dataKey="masculino" stackId="a" fill="#8884d8" name="Masculino" />
                <Bar dataKey="feminino" stackId="a" fill="#82ca9d" name="Feminino" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pacientes por Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição de Pacientes por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pacientesPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pacientesPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
