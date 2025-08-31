import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { patientSchema, PatientFormData, statusOptions, nivelAtencaoOptions, tipoCuidadoOptions } from '@/schemas/patientSchema';

interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PatientFormData) => void;
  patient?: any;
  isLoading?: boolean;
}

const PatientFormDialog: React.FC<PatientFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  patient,
  isLoading = false,
}) => {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      cns: patient?.cns || '',
      cpf: patient?.cpf || '',
      nomeCompleto: patient?.nomeCompleto || '',
      dataNascimento: patient?.dataNascimento ? new Date(patient.dataNascimento.toDate()) : undefined,
      sexo: patient?.sexo || undefined,
      telefoneContato: patient?.telefoneContato || '',
      endereco: {
        rua: patient?.endereco?.rua || '',
        numero: patient?.endereco?.numero || '',
        bairro: patient?.endereco?.bairro || '',
        cidade: patient?.endereco?.cidade || '',
        cep: patient?.endereco?.cep || '',
      },
      nivelAtencao: patient?.nivelAtencao || undefined,
      status: patient?.status || undefined,
      tipoCuidado: patient?.tipoCuidado || [],
    },
  });

  React.useEffect(() => {
    if (patient) {
      form.reset({
        cns: patient.cns || '',
        cpf: patient.cpf || '',
        nomeCompleto: patient.nomeCompleto || '',
        dataNascimento: patient.dataNascimento ? new Date(patient.dataNascimento.toDate()) : undefined,
        sexo: patient.sexo || undefined,
        telefoneContato: patient.telefoneContato || '',
        endereco: {
          rua: patient.endereco?.rua || '',
          numero: patient.endereco?.numero || '',
          bairro: patient.endereco?.bairro || '',
          cidade: patient.endereco?.cidade || '',
          cep: patient.endereco?.cep || '',
        },
        nivelAtencao: patient.nivelAtencao || undefined,
        status: patient.status || undefined,
        tipoCuidado: patient.tipoCuidado || [],
      });
    } else {
      form.reset({
        cns: '',
        cpf: '',
        nomeCompleto: '',
        dataNascimento: undefined,
        sexo: undefined,
        telefoneContato: '',
        endereco: {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          cep: '',
        },
        nivelAtencao: undefined,
        status: undefined,
        tipoCuidado: [],
      });
    }
  }, [patient, form]);

  const handleSubmit = (data: PatientFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Editar Paciente' : 'Adicionar Paciente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNS</FormLabel>
                    <FormControl>
                      <Input placeholder="CNS do paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomeCompleto"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1920-01-01")
                          }
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Sexo *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Masculino" id="masculino" />
                          <label htmlFor="masculino">Masculino</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Feminino" id="feminino" />
                          <label htmlFor="feminino">Feminino</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefoneContato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(47) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="nivelAtencao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Atenção</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nivelAtencaoOptions.map((nivel) => (
                          <SelectItem key={nivel} value={nivel}>
                            {nivel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Tipo de Cuidado com Múltipla Seleção */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tipoCuidado"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Tipo de Cuidado</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {tipoCuidadoOptions.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="tipoCuidado"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="endereco.rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : patient ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormDialog;
