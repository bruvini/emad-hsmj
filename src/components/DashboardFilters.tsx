
import React from 'react';
import { Calendar, CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFiltersProps {
  filters: {
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
    professionalId?: string;
    cargo?: string;
    modalidade?: string;
    nivelAtencao?: string;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
  patientOptions: FilterOption[];
  professionalOptions: FilterOption[];
  cargoOptions: FilterOption[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
  patientOptions,
  professionalOptions,
  cargoOptions,
}) => {
  const modalidadeOptions = [
    'Teleatendimento',
    'Demanda Espontânea',
    'Atendimento Programado',
    'Análise de Elegibilidade'
  ];

  const nivelAtencaoOptions = ['AD I', 'AD II', 'AD III'];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Período - Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => handleFilterChange('startDate', date)}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Período - Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => handleFilterChange('endDate', date)}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Paciente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {filters.patientId 
                    ? patientOptions.find(p => p.value === filters.patientId)?.label || "Paciente selecionado"
                    : "Selecionar paciente"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <Command>
                  <CommandInput placeholder="Buscar paciente..." />
                  <CommandList>
                    <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {patientOptions.map((patient) => (
                        <CommandItem
                          key={patient.value}
                          onSelect={() => handleFilterChange('patientId', patient.value)}
                        >
                          {patient.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Profissional */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {filters.professionalId 
                    ? professionalOptions.find(p => p.value === filters.professionalId)?.label || "Profissional selecionado"
                    : "Selecionar profissional"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <Command>
                  <CommandInput placeholder="Buscar profissional..." />
                  <CommandList>
                    <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                    <CommandGroup>
                      {professionalOptions.map((professional) => (
                        <CommandItem
                          key={professional.value}
                          onSelect={() => handleFilterChange('professionalId', professional.value)}
                        >
                          {professional.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cargo</label>
            <Select value={filters.cargo || ""} onValueChange={(value) => handleFilterChange('cargo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargoOptions.map((cargo) => (
                  <SelectItem key={cargo.value} value={cargo.value}>
                    {cargo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modalidade</label>
            <Select value={filters.modalidade || ""} onValueChange={(value) => handleFilterChange('modalidade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidadeOptions.map((modalidade) => (
                  <SelectItem key={modalidade} value={modalidade}>
                    {modalidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Atenção */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nível de Atenção</label>
            <Select value={filters.nivelAtencao || ""} onValueChange={(value) => handleFilterChange('nivelAtencao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar nível" />
              </SelectTrigger>
              <SelectContent>
                {nivelAtencaoOptions.map((nivel) => (
                  <SelectItem key={nivel} value={nivel}>
                    {nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onApplyFilters} disabled={loading} className="flex-1">
            {loading ? "Carregando..." : "Aplicar Filtros"}
          </Button>
          <Button variant="outline" onClick={onClearFilters} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
