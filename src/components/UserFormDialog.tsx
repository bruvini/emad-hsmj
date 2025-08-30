
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { userSchema, UserFormData, availablePages } from '@/schemas/userSchema';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: any;
  isLoading?: boolean;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false
}) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      matricula: '',
      nomeCompleto: '',
      cargo: 'Enfermeiro',
      username: '',
      tipoDeAcesso: 'Comum',
      paginasAcessiveis: []
    }
  });

  const tipoDeAcesso = form.watch('tipoDeAcesso');
  const nomeCompleto = form.watch('nomeCompleto');

  // Lógica de sugestão automática de username
  useEffect(() => {
    if (nomeCompleto && !user) {
      const names = nomeCompleto.trim().split(' ').filter(Boolean);
      if (names.length >= 2) {
        const firstName = names[0];
        const lastName = names[names.length - 1];
        const suggestion = `${firstName}.${lastName}`.toLowerCase();
        form.setValue('username', suggestion);
      }
    }
  }, [nomeCompleto, user, form]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (user) {
      form.reset({
        matricula: user.matricula || '',
        nomeCompleto: user.nomeCompleto || '',
        cargo: user.cargo || 'Enfermeiro',
        username: user.username || '',
        tipoDeAcesso: user.tipoDeAcesso || 'Comum',
        paginasAcessiveis: user.paginasAcessiveis || []
      });
    } else {
      form.reset({
        matricula: '',
        nomeCompleto: '',
        cargo: 'Enfermeiro',
        username: '',
        tipoDeAcesso: 'Comum',
        paginasAcessiveis: []
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite apenas números"
                      pattern="[0-9]*"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo do usuário" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Enfermeiro">Enfermeiro</SelectItem>
                      <SelectItem value="Médico">Médico</SelectItem>
                      <SelectItem value="Técnico de Enfermagem">Técnico de Enfermagem</SelectItem>
                      <SelectItem value="Assistente Administrativo">Assistente Administrativo</SelectItem>
                      <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                      <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
                      <SelectItem value="Psicólogo">Psicólogo</SelectItem>
                      <SelectItem value="Assistente Social">Assistente Social</SelectItem>
                      <SelectItem value="Farmacêutico">Farmacêutico</SelectItem>
                      <SelectItem value="Coordenador">Coordenador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="nome.sobrenome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoDeAcesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Acesso</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ADMIN" id="admin" />
                        <Label htmlFor="admin">Administrador</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Comum" id="comum" />
                        <Label htmlFor="comum">Comum</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipoDeAcesso === 'Comum' && (
              <FormField
                control={form.control}
                name="paginasAcessiveis"
                render={() => (
                  <FormItem>
                    <FormLabel>Páginas Acessíveis</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePages.map((page) => (
                        <FormField
                          key={page}
                          control={form.control}
                          name="paginasAcessiveis"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={page}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(page)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, page])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== page
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {page}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
