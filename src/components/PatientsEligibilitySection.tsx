
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientEligibility {
  id: string;
  nomeCompleto: string;
  dataNascimento: any;
  telefoneContato?: string;
  dataInclusao: any;
  nivelAtencao?: string;
}

interface PatientsEligibilitySectionProps {
  onPatientStatusChanged: () => void;
}

const PatientsEligibilitySection: React.FC<PatientsEligibilitySectionProps> = ({ 
  onPatientStatusChanged 
}) => {
  const [patientsInAnalysis, setPatientsInAnalysis] = useState<PatientEligibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadPatientsInAnalysis = async () => {
    try {
      const q = query(
        collection(db, 'pacientesEMAD'),
        where('status', '==', 'Análise de Elegibilidade')
      );
      const querySnapshot = await getDocs(q);
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientEligibility[];
      setPatientsInAnalysis(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes em análise:', error);
      toast.error('Erro ao carregar pacientes em análise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientsInAnalysis();
  }, []);

  const updatePatientStatus = async (patientId: string, newStatus: 'Ativo' | 'Inelegível') => {
    setUpdating(patientId);
    try {
      const patientDoc = doc(db, 'pacientesEMAD', patientId);
      await updateDoc(patientDoc, {
        status: newStatus
      });

      const patientName = patientsInAnalysis.find(p => p.id === patientId)?.nomeCompleto;
      const statusText = newStatus === 'Ativo' ? 'elegível' : 'inelegível';
      
      toast.success(`Paciente ${patientName} marcado como ${statusText}`);
      
      // Remove patient from local state
      setPatientsInAnalysis(prev => prev.filter(p => p.id !== patientId));
      
      // Notify parent component to refresh main table
      onPatientStatusChanged();
    } catch (error) {
      console.error('Erro ao atualizar status do paciente:', error);
      toast.error('Erro ao atualizar status do paciente');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  if (patientsInAnalysis.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pacientes em Análise de Elegibilidade
        </h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Nenhum paciente aguardando análise de elegibilidade</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Pacientes em Análise de Elegibilidade
        </h2>
        <Badge variant="secondary" className="text-sm">
          {patientsInAnalysis.length} paciente(s)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patientsInAnalysis.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base font-medium">
                    {patient.nomeCompleto}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Em Análise
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {patient.dataNascimento && (
                <p className="text-sm text-gray-600">
                  <strong>Nascimento:</strong> {format(patient.dataNascimento.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
              
              {patient.telefoneContato && (
                <p className="text-sm text-gray-600">
                  <strong>Telefone:</strong> {patient.telefoneContato}
                </p>
              )}
              
              {patient.nivelAtencao && (
                <p className="text-sm text-gray-600">
                  <strong>Nível:</strong> {patient.nivelAtencao}
                </p>
              )}
              
              <p className="text-sm text-gray-600">
                <strong>Incluído em:</strong> {format(patient.dataInclusao.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => updatePatientStatus(patient.id, 'Ativo')}
                  disabled={updating === patient.id}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {updating === patient.id ? 'Atualizando...' : 'Elegível'}
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updatePatientStatus(patient.id, 'Inelegível')}
                  disabled={updating === patient.id}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {updating === patient.id ? 'Atualizando...' : 'Inelegível'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientsEligibilitySection;
