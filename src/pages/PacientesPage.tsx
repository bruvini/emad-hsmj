import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Pencil, Trash2, Eye } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PatientFormDialog from '@/components/PatientFormDialog';
import PatientViewDialog from '@/components/PatientViewDialog';
import { PatientFormData } from '@/schemas/patientSchema';

interface Paciente {
  id: string;
  cns?: string;
  cpf?: string;
  nomeCompleto: string;
  dataNascimento: Timestamp;
  sexo: 'Masculino' | 'Feminino';
  telefoneContato?: string;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  nivelAtencao?: 'AD I' | 'AD II' | 'AD III';
  status: 'Análise de Elegibilidade' | 'Ativo' | 'Alta por Melhora' | 'Alta Administrativa com Encaminhamento' | 'Óbito' | 'Inelegível';
  tipoCuidado?: string[]; // Alterado para array de strings
  dataInclusao: Timestamp;
}

const PacientesPage: React.FC = () => {
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Paciente | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Paciente | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'pacientesEMAD'),
        orderBy('dataInclusao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Paciente[];
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const checkDuplicates = async (patientData: PatientFormData, editingId?: string) => {
    const checks = [];
    
    if (patientData.cns) {
      const cnsQuery = query(
        collection(db, 'pacientesEMAD'),
        where('cns', '==', patientData.cns)
      );
      checks.push(getDocs(cnsQuery));
    }

    if (patientData.cpf) {
      const cpfQuery = query(
        collection(db, 'pacientesEMAD'),
        where('cpf', '==', patientData.cpf)
      );
      checks.push(getDocs(cpfQuery));
    }

    const results = await Promise.all(checks);
    
    for (const snapshot of results) {
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        if (!editingId || existingDoc.id !== editingId) {
          return true; // Duplicata encontrada
        }
      }
    }
    
    return false;
  };

  const handleSavePatient = async (patientData: PatientFormData) => {
    setSaving(true);
    try {
      // Verificar duplicidade
      const isDuplicate = await checkDuplicates(patientData, editingPatient?.id);
      if (isDuplicate) {
        toast.error('Já existe um paciente com o mesmo CNS ou CPF');
        setSaving(false);
        return;
      }

      const dataToSave = {
        ...patientData,
        nomeCompleto: patientData.nomeCompleto.toUpperCase(),
      };

      if (editingPatient) {
        // Atualizar paciente existente
        const patientDoc = doc(db, 'pacientesEMAD', editingPatient.id);
        await updateDoc(patientDoc, dataToSave);
        toast.success('Paciente atualizado com sucesso');
      } else {
        // Criar novo paciente
        await addDoc(collection(db, 'pacientesEMAD'), {
          ...dataToSave,
          dataInclusao: serverTimestamp(),
        });
        toast.success('Paciente cadastrado com sucesso');
      }

      setShowFormDialog(false);
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast.error('Erro ao salvar paciente');
    }
    setSaving(false);
  };

  const handleEdit = (patient: Paciente) => {
    setEditingPatient(patient);
    setShowFormDialog(true);
  };

  const handleView = (patient: Paciente) => {
    setViewingPatient(patient);
    setShowViewDialog(true);
  };

  const handleDelete = (patient: Paciente) => {
    setPatientToDelete(patient);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await deleteDoc(doc(db, 'pacientesEMAD', patientToDelete.id));
      toast.success('Paciente removido com sucesso');
      setShowDeleteDialog(false);
      setPatientToDelete(null);
      loadPatients();
    } catch (error) {
      console.error('Erro ao remover paciente:', error);
      toast.error('Erro ao remover paciente');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pacientes</h1>
          <p className="text-gray-600">Cadastro e acompanhamento de pacientes</p>
        </div>
        <Button
          onClick={() => setShowFormDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus size={16} />
          Adicionar Paciente
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Nível de Atenção</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Inclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum paciente encontrado
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{patient.nomeCompleto}</TableCell>
                  <TableCell>{patient.nivelAtencao || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.status === 'Ativo' 
                        ? 'bg-green-100 text-green-800'
                        : patient.status === 'Óbito'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(patient.dataInclusao)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(patient)}
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(patient)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PatientFormDialog
        isOpen={showFormDialog}
        onClose={() => {
          setShowFormDialog(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        patient={editingPatient}
        isLoading={saving}
      />

      <PatientViewDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setViewingPatient(null);
        }}
        patient={viewingPatient}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o paciente{' '}
              <strong>{patientToDelete?.nomeCompleto}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PacientesPage;
