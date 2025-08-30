
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PatientViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

const PatientViewDialog: React.FC<PatientViewDialogProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  if (!patient) return null;

  const formatDate = (date: any) => {
    if (!date) return '-';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Detalhes do Paciente</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">CNS</label>
              <p className="text-sm">{patient.cns || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">CPF</label>
              <p className="text-sm">{patient.cpf || '-'}</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <p className="text-sm font-medium">{patient.nomeCompleto}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
              <p className="text-sm">{formatDate(patient.dataNascimento)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Sexo</label>
              <p className="text-sm">{patient.sexo}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p className="text-sm">{patient.telefoneContato || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={patient.status === 'Ativo' ? 'default' : 'secondary'}>
                  {patient.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Nível de Atenção</label>
              <p className="text-sm">{patient.nivelAtencao || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Cuidado</label>
              <p className="text-sm">{patient.tipoCuidado || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Inclusão</label>
              <p className="text-sm">{formatDate(patient.dataInclusao)}</p>
            </div>
          </div>

          {patient.endereco && (
            <div>
              <h3 className="text-lg font-medium mb-3">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rua</label>
                  <p className="text-sm">{patient.endereco.rua || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número</label>
                  <p className="text-sm">{patient.endereco.numero || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                  <p className="text-sm">{patient.endereco.bairro || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="text-sm">{patient.endereco.cidade || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">CEP</label>
                  <p className="text-sm">{patient.endereco.cep || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientViewDialog;
