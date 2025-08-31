import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, CheckCircle2, User, Calendar } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Atendimento {
  id?: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId: string;
  profissionalNome: string;
  horaInicio: Timestamp;
  horaFim: Timestamp | null;
  tipoAtendimento: 'Teleatendimento' | 'Demanda Espontânea' | 'Atendimento Programado' | 'Análise de Elegibilidade';
  observacao?: string;
  status: 'Em Andamento' | 'Concluído';
}

interface PacienteOption {
  value: string;
  label: string;
}

interface UsuarioOption {
  value: string;
  label: string;
}

const atendimentoSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  profissionalId: z.string().min(1, 'Selecione um profissional'),
  tipoAtendimento: z.enum(['Teleatendimento', 'Demanda Espontânea', 'Atendimento Programado', 'Análise de Elegibilidade'], {
    message: 'Selecione um tipo de atendimento'
  }),
  horaInicio: z.string().min(1, 'Informe a hora de início'),
  horaFim: z.string().optional(),
  observacao: z.string().optional(),
});

type AtendimentoFormData = z.infer<typeof atendimentoSchema>;

const AtendimentosPage: React.FC = () => {
  const [atendimentosEmAndamento, setAtendimentosEmAndamento] = useState<Atendimento[]>([]);
  const [atendimentosConcluidos, setAtendimentosConcluidos] = useState<Atendimento[]>([]);
  const [pacientesOptions, setPacientesOptions] = useState<PacienteOption[]>([]);
  const [usuariosOptions, setUsuariosOptions] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [saving, setSaving] = useState(false);
  const [pacienteComboboxOpen, setPacienteComboboxOpen] = useState(false);
  const [profissionalComboboxOpen, setProfissionalComboboxOpen] = useState(false);

  const form = useForm<AtendimentoFormData>({
    resolver: zodResolver(atendimentoSchema),
    defaultValues: {
      pacienteId: '',
      profissionalId: '',
      tipoAtendimento: undefined,
      horaInicio: '',
      horaFim: '',
      observacao: '',
    }
  });

  const loadAtendimentos = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar atendimentos em andamento
      const emAndamentoQuery = query(
        collection(db, 'atendimentosEMAD'),
        where('status', '==', 'Em Andamento'),
        orderBy('horaInicio', 'desc')
      );
      const emAndamentoSnapshot = await getDocs(emAndamentoQuery);
      const emAndamentoData = emAndamentoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Atendimento[];
      setAtendimentosEmAndamento(emAndamentoData);

      // Buscar atendimentos concluídos
      const concluidosQuery = query(
        collection(db, 'atendimentosEMAD'),
        where('status', '==', 'Concluído'),
        orderBy('horaFim', 'desc')
      );
      const concluidosSnapshot = await getDocs(concluidosQuery);
      const concluidosData = concluidosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Atendimento[];
      setAtendimentosConcluidos(concluidosData);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
    }
    setLoading(false);
  }, []);

  const loadPacientes = useCallback(async () => {
    try {
      // Consulta sem filtro de status para garantir que todos pacientes sejam retornados
      const pacientesQuery = query(collection(db, 'pacientesEMAD'), orderBy('nomeCompleto'));
      const querySnapshot = await getDocs(pacientesQuery);

      // Logs de diagnóstico
      console.log('[Atendimentos] Pacientes - documentos encontrados:', querySnapshot.docs.length);

      const pacientesData: PacienteOption[] = querySnapshot.docs.map((d) => {
        const data: any = d.data();
        console.log('[Atendimentos] Mapeando paciente:', { id: d.id, nomeCompleto: data?.nomeCompleto });
        return {
          value: d.id,
          label: data?.nomeCompleto ?? '(Sem nome)',
        };
      });

      console.log('[Atendimentos] Pacientes mapeados para Combobox:', pacientesData);
      setPacientesOptions(pacientesData);
    } catch (error) {
      console.error('Erro detalhado ao buscar pacientes:', error);
      toast.error('Erro ao carregar pacientes. Veja o console para detalhes.');
    }
  }, []);

  const loadUsuarios = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usuariosData = querySnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().nomeCompleto
      })) as UsuarioOption[];
      
      console.log('Usuários carregados:', usuariosData);
      setUsuariosOptions(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  }, []);

  useEffect(() => {
    loadAtendimentos();
    loadPacientes();
    loadUsuarios();
  }, [loadAtendimentos, loadPacientes, loadUsuarios]);

  const handleNovoAtendimento = () => {
    setEditingAtendimento(null);
    const now = new Date();
    const localDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
    form.reset({
      pacienteId: '',
      profissionalId: '',
      tipoAtendimento: undefined,
      horaInicio: localDateTime,
      horaFim: '',
      observacao: '',
    });
    setShowDialog(true);
  };

  const handleConcluirAtendimento = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    
    const now = new Date();
    const localDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
    const inicioDateTime = format(atendimento.horaInicio.toDate(), "yyyy-MM-dd'T'HH:mm");
    
    form.reset({
      pacienteId: atendimento.pacienteId,
      profissionalId: atendimento.profissionalId,
      tipoAtendimento: atendimento.tipoAtendimento,
      horaInicio: inicioDateTime,
      horaFim: localDateTime,
      observacao: atendimento.observacao || '',
    });
    setShowDialog(true);
  };

  const onSubmit = async (data: AtendimentoFormData) => {
    setSaving(true);
    try {
      const paciente = pacientesOptions.find(p => p.value === data.pacienteId);
      const profissional = usuariosOptions.find(u => u.value === data.profissionalId);

      if (!paciente || !profissional) {
        toast.error('Paciente ou profissional não encontrado');
        setSaving(false);
        return;
      }

      const horaInicioTimestamp = Timestamp.fromDate(new Date(data.horaInicio));
      const horaFimTimestamp = data.horaFim ? Timestamp.fromDate(new Date(data.horaFim)) : null;

      const atendimentoData = {
        pacienteId: data.pacienteId,
        pacienteNome: paciente.label,
        profissionalId: data.profissionalId,
        profissionalNome: profissional.label,
        tipoAtendimento: data.tipoAtendimento,
        horaInicio: horaInicioTimestamp,
        horaFim: horaFimTimestamp,
        observacao: data.observacao || '',
        status: horaFimTimestamp ? 'Concluído' : 'Em Andamento'
      };

      if (editingAtendimento) {
        // Concluir atendimento existente
        const atendimentoDoc = doc(db, 'atendimentosEMAD', editingAtendimento.id!);
        await updateDoc(atendimentoDoc, {
          horaFim: horaFimTimestamp,
          observacao: data.observacao || '',
          status: 'Concluído'
        });
        toast.success('Atendimento concluído com sucesso');
      } else {
        // Criar novo atendimento
        await addDoc(collection(db, 'atendimentosEMAD'), atendimentoData);
        toast.success('Atendimento iniciado com sucesso');
      }

      setShowDialog(false);
      setEditingAtendimento(null);
      loadAtendimentos();
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast.error('Erro ao salvar atendimento');
    }
    setSaving(false);
  };

  const formatDateTime = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const calcularDuracao = (inicio: Timestamp, fim: Timestamp) => {
    const minutos = differenceInMinutes(fim.toDate(), inicio.toDate());
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutosRestantes}min`;
    }
    return `${minutos}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Atendimentos</h1>
          <p className="text-gray-600">Gerencie os atendimentos da equipe EMAD</p>
        </div>
        <Button onClick={handleNovoAtendimento} className="flex items-center gap-2">
          <Plus size={16} />
          Novo Atendimento
        </Button>
      </div>

      {/* Seção 1: Atendimentos em Andamento */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-orange-600" />
          Atendimentos em Andamento
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : atendimentosEmAndamento.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-gray-600">Nenhum atendimento pendente. Bom trabalho!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {atendimentosEmAndamento.map((atendimento) => (
              <Card key={atendimento.id} className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User size={18} />
                    {atendimento.pacienteNome}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Profissional:</strong> {atendimento.profissionalNome}</p>
                    <p><strong>Tipo:</strong> {atendimento.tipoAtendimento}</p>
                    <p className="flex items-center gap-1">
                      <Calendar size={14} />
                      <strong>Iniciado em:</strong> {formatDateTime(atendimento.horaInicio)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleConcluirAtendimento(atendimento)}
                    className="w-full"
                    variant="default"
                  >
                    Concluir Atendimento
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Seção 2: Histórico de Atendimentos Concluídos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-600" />
          Histórico de Atendimentos Concluídos
        </h2>
        
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atendimentosConcluidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum atendimento concluído encontrado
                  </TableCell>
                </TableRow>
              ) : (
                atendimentosConcluidos.map((atendimento) => (
                  <TableRow key={atendimento.id}>
                    <TableCell className="font-medium">{atendimento.pacienteNome}</TableCell>
                    <TableCell>{atendimento.profissionalNome}</TableCell>
                    <TableCell>{atendimento.tipoAtendimento}</TableCell>
                    <TableCell>{formatDateTime(atendimento.horaInicio)}</TableCell>
                    <TableCell>{atendimento.horaFim ? formatDateTime(atendimento.horaFim) : '-'}</TableCell>
                    <TableCell>
                      {atendimento.horaFim ? calcularDuracao(atendimento.horaInicio, atendimento.horaFim) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Registro/Conclusão */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAtendimento ? 'Concluir Atendimento' : 'Novo Atendimento'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Combobox para Paciente */}
              <FormField
                control={form.control}
                name="pacienteId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Paciente</FormLabel>
                    <Popover open={pacienteComboboxOpen} onOpenChange={setPacienteComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!!editingAtendimento}
                          >
                            {field.value
                              ? pacientesOptions.find((paciente) => paciente.value === field.value)?.label
                              : "Selecione um paciente"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar paciente..." />
                          <CommandList>
                            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                            <CommandGroup>
                              {pacientesOptions.map((paciente) => (
                                <CommandItem
                                  value={paciente.label}
                                  key={paciente.value}
                                  onSelect={() => {
                                    form.setValue("pacienteId", paciente.value);
                                    setPacienteComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      paciente.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {paciente.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Combobox para Profissional */}
              <FormField
                control={form.control}
                name="profissionalId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Profissional</FormLabel>
                    <Popover open={profissionalComboboxOpen} onOpenChange={setProfissionalComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!!editingAtendimento}
                          >
                            {field.value
                              ? usuariosOptions.find((usuario) => usuario.value === field.value)?.label
                              : "Selecione um profissional"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar profissional..." />
                          <CommandList>
                            <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                            <CommandGroup>
                              {usuariosOptions.map((usuario) => (
                                <CommandItem
                                  value={usuario.label}
                                  key={usuario.value}
                                  onSelect={() => {
                                    form.setValue("profissionalId", usuario.value);
                                    setProfissionalComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      usuario.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {usuario.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoAtendimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atendimento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!!editingAtendimento}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Teleatendimento">Teleatendimento</SelectItem>
                        <SelectItem value="Demanda Espontânea">Demanda Espontânea</SelectItem>
                        <SelectItem value="Atendimento Programado">Atendimento Programado</SelectItem>
                        <SelectItem value="Análise de Elegibilidade">Análise de Elegibilidade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        disabled={!!editingAtendimento}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingAtendimento && (
                <FormField
                  control={form.control}
                  name="horaFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Término</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações sobre o atendimento..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : (editingAtendimento ? 'Concluir' : 'Iniciar')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AtendimentosPage;
