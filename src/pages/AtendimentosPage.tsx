
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

interface Paciente {
  id: string;
  nomeCompleto: string;
  status: string;
}

interface Usuario {
  id: string;
  nomeCompleto: string;
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
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [saving, setSaving] = useState(false);

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
      const q = query(
        collection(db, 'pacientesEMAD'),
        where('status', '==', 'Ativo'),
        orderBy('nomeCompleto')
      );
      const querySnapshot = await getDocs(q);
      const pacientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto,
        status: doc.data().status
      })) as Paciente[];
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  }, []);

  const loadUsuarios = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuariosEMAD'));
      const usuariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nomeCompleto: doc.data().nomeCompleto
      })) as Usuario[];
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
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
    const pacienteNome = pacientes.find(p => p.id === atendimento.pacienteId)?.nomeCompleto || atendimento.pacienteNome;
    const profissionalNome = usuarios.find(u => u.id === atendimento.profissionalId)?.nomeCompleto || atendimento.profissionalNome;
    
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
      const paciente = pacientes.find(p => p.id === data.pacienteId);
      const profissional = usuarios.find(u => u.id === data.profissionalId);

      if (!paciente || !profissional) {
        toast.error('Paciente ou profissional não encontrado');
        setSaving(false);
        return;
      }

      const horaInicioTimestamp = Timestamp.fromDate(new Date(data.horaInicio));
      const horaFimTimestamp = data.horaFim ? Timestamp.fromDate(new Date(data.horaFim)) : null;

      const atendimentoData = {
        pacienteId: data.pacienteId,
        pacienteNome: paciente.nomeCompleto,
        profissionalId: data.profissionalId,
        profissionalNome: profissional.nomeCompleto,
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
              <FormField
                control={form.control}
                name="pacienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!!editingAtendimento}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pacientes.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id}>
                            {paciente.nomeCompleto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profissionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!!editingAtendimento}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.nomeCompleto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
