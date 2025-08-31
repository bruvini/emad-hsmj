import React, { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { FilterState, PacienteData, UsuarioData } from '@/types/dashboard';

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading: boolean;
}

export default function DashboardFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading
}: DashboardFiltersProps) {
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [pacienteOpen, setPacienteOpen] = useState(false);
  const [profissionalOpen, setProfissionalOpen] = useState(false);

  useEffect(() => {
    loadPacientes();
    loadUsuarios();
  }, []);

  const loadPacientes = async () => {
    try {
      const pacientesSnapshot = await getDocs(collection(db, 'pacientesEMAD'));
      const pacientesData = pacientesSnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto
      }));
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const usuariosSnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usuariosData = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto,
        cargo: doc.data().cargo
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const cargosUnicos = [...new Set(usuarios.map(u => u.cargo))].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros Globais do Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateStart ? format(filters.dateStart, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateStart}
                  onSelect={(date) => updateFilter('dateStart', date)}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={2030}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateEnd ? format(filters.dateEnd, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateEnd}
                  onSelect={(date) => updateFilter('dateEnd', date)}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={2030}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Paciente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente</label>
            <Popover open={pacienteOpen} onOpenChange={setPacienteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={pacienteOpen}
                  className="w-full justify-between"
                >
                  {filters.pacienteId 
                    ? pacientes.find(p => p.id === filters.pacienteId)?.nomeCompleto
                    : "Selecionar paciente"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar paciente..." />
                  <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {pacientes.map((paciente) => (
                      <CommandItem
                        key={paciente.id}
                        onSelect={() => {
                          updateFilter('pacienteId', paciente.id);
                          setPacienteOpen(false);
                        }}
                      >
                        {paciente.nomeCompleto}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Profissional */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <Popover open={profissionalOpen} onOpenChange={setProfissionalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={profissionalOpen}
                  className="w-full justify-between"
                >
                  {filters.profissionalId 
                    ? usuarios.find(u => u.id === filters.profissionalId)?.nomeCompleto
                    : "Selecionar profissional"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar profissional..." />
                  <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                  <CommandGroup>
                    {usuarios.map((usuario) => (
                      <CommandItem
                        key={usuario.id}
                        onSelect={() => {
                          updateFilter('profissionalId', usuario.id);
                          setProfissionalOpen(false);
                        }}
                      >
                        {usuario.nomeCompleto}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cargo</label>
            <Select value={filters.cargo} onValueChange={(value) => updateFilter('cargo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargosUnicos.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade de Atendimento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modalidade</label>
            <Select value={filters.modalidadeAtendimento} onValueChange={(value) => updateFilter('modalidadeAtendimento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teleatendimento">Teleatendimento</SelectItem>
                <SelectItem value="Demanda Espontânea">Demanda Espontânea</SelectItem>
                <SelectItem value="Atendimento Programado">Atendimento Programado</SelectItem>
                <SelectItem value="Análise de Elegibilidade">Análise de Elegibilidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Atenção */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nível de Atenção</label>
            <Select value={filters.nivelAtencao} onValueChange={(value) => updateFilter('nivelAtencao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AD I">AD I</SelectItem>
                <SelectItem value="AD II">AD II</SelectItem>
                <SelectItem value="AD III">AD III</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onApplyFilters} disabled={loading} className="flex-1">
            {loading ? 'Carregando...' : 'Aplicar Filtros'}
          </Button>
          <Button variant="outline" onClick={onClearFilters} disabled={loading}>
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
