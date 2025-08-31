
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AtendimentoData, UsuarioData } from '@/types/dashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DetailTablesProps {
  atendimentos: AtendimentoData[];
  usuarios: UsuarioData[];
  detailFilter: { type: string; value: string } | null;
  onFilterChange: (filter: { type: string; value: string } | null) => void;
}

export default function DetailTables({
  atendimentos,
  usuarios,
  detailFilter,
  onFilterChange
}: DetailTablesProps) {

  // Processamento dos dados para as tabelas de ranking
  const rankingData = React.useMemo(() => {
    const pacientesCount = new Map<string, number>();
    const profissionaisCount = new Map<string, number>();
    const cargosCount = new Map<string, number>();
    const modalidadesCount = new Map<string, number>();

    atendimentos.forEach(atendimento => {
      // Top Pacientes (Hiperutilizadores)
      const pacienteNome = atendimento.pacienteNome || 'Não informado';
      pacientesCount.set(pacienteNome, (pacientesCount.get(pacienteNome) || 0) + 1);

      // Top Profissionais
      const profissionalNome = atendimento.profissionalNome || 'Não informado';
      profissionaisCount.set(profissionalNome, (profissionaisCount.get(profissionalNome) || 0) + 1);

      // Top Cargos
      const usuario = usuarios.find(u => u.id === atendimento.profissionalId);
      const cargo = usuario?.cargo || 'Não informado';
      cargosCount.set(cargo, (cargosCount.get(cargo) || 0) + 1);

      // Top Modalidades
      const modalidade = atendimento.tipoAtendimento || 'Não informado';
      modalidadesCount.set(modalidade, (modalidadesCount.get(modalidade) || 0) + 1);
    });

    return {
      topPacientes: Array.from(pacientesCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nome, count]) => ({ nome, count })),
      
      topProfissionais: Array.from(profissionaisCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nome, count]) => ({ nome, count })),
      
      topCargos: Array.from(cargosCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([nome, count]) => ({ nome, count })),
      
      topModalidades: Array.from(modalidadesCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([nome, count]) => ({ nome, count }))
    };
  }, [atendimentos, usuarios]);

  // Dados filtrados para a tabela principal
  const filteredAtendimentos = React.useMemo(() => {
    if (!detailFilter) return atendimentos;

    return atendimentos.filter(atendimento => {
      switch (detailFilter.type) {
        case 'paciente':
          return atendimento.pacienteNome === detailFilter.value;
        case 'profissional':
          return atendimento.profissionalNome === detailFilter.value;
        case 'cargo':
          const usuario = usuarios.find(u => u.id === atendimento.profissionalId);
          return usuario?.cargo === detailFilter.value;
        case 'modalidade':
          return atendimento.tipoAtendimento === detailFilter.value;
        default:
          return true;
      }
    });
  }, [atendimentos, usuarios, detailFilter]);

  const handleRowClick = (type: string, value: string) => {
    // Se a linha já está selecionada, limpa o filtro
    if (detailFilter?.type === type && detailFilter?.value === value) {
      onFilterChange(null);
    } else {
      onFilterChange({ type, value });
    }
  };

  const isRowSelected = (type: string, value: string) => {
    return detailFilter?.type === type && detailFilter?.value === value;
  };

  const formatDuration = (inicio: any, fim: any) => {
    if (!inicio || !fim) return '-';
    const startTime = inicio.toDate();
    const endTime = fim.toDate();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    return `${durationMinutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Grid das Tabelas de Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Top Hiperutilizadores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Hiperutilizadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.topPacientes.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`cursor-pointer hover:bg-muted ${
                      isRowSelected('paciente', item.nome) ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleRowClick('paciente', item.nome)}
                  >
                    <TableCell className="font-medium">
                      {item.nome.length > 25 ? item.nome.substring(0, 25) + '...' : item.nome}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.topProfissionais.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`cursor-pointer hover:bg-muted ${
                      isRowSelected('profissional', item.nome) ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleRowClick('profissional', item.nome)}
                  >
                    <TableCell className="font-medium">
                      {item.nome.length > 25 ? item.nome.substring(0, 25) + '...' : item.nome}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Cargos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Cargos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.topCargos.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`cursor-pointer hover:bg-muted ${
                      isRowSelected('cargo', item.nome) ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleRowClick('cargo', item.nome)}
                  >
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Modalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Modalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.topModalidades.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`cursor-pointer hover:bg-muted ${
                      isRowSelected('modalidade', item.nome) ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleRowClick('modalidade', item.nome)}
                  >
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Detalhamento */}
      <Card>
        <CardHeader>
          <CardTitle>
            {detailFilter 
              ? `Detalhes dos Atendimentos - ${detailFilter.type === 'paciente' ? 'Paciente' : 
                  detailFilter.type === 'profissional' ? 'Profissional' :
                  detailFilter.type === 'cargo' ? 'Cargo' : 'Modalidade'}: ${detailFilter.value}`
              : 'Detalhes dos Atendimentos (Todos)'
            }
          </CardTitle>
          {detailFilter && (
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredAtendimentos.length} de {atendimentos.length} atendimentos
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Hora Início</TableHead>
                  <TableHead>Hora Fim</TableHead>
                  <TableHead>Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAtendimentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum atendimento encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAtendimentos.map((atendimento) => {
                    const usuario = usuarios.find(u => u.id === atendimento.profissionalId);
                    const cargo = usuario?.cargo || 'Não informado';
                    
                    return (
                      <TableRow key={atendimento.id}>
                        <TableCell>
                          {atendimento.horaInicio 
                            ? format(atendimento.horaInicio.toDate(), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {atendimento.pacienteNome || 'Não informado'}
                        </TableCell>
                        <TableCell>{atendimento.tipoAtendimento || 'Não informado'}</TableCell>
                        <TableCell>{atendimento.profissionalNome || 'Não informado'}</TableCell>
                        <TableCell>{cargo}</TableCell>
                        <TableCell>
                          {atendimento.horaInicio 
                            ? format(atendimento.horaInicio.toDate(), 'HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {atendimento.horaFim 
                            ? format(atendimento.horaFim.toDate(), 'HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {formatDuration(atendimento.horaInicio, atendimento.horaFim)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
