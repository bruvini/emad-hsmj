
export interface FilterState {
  dateStart: Date | undefined;
  dateEnd: Date | undefined;
  pacienteId: string;
  profissionalId: string;
  cargo: string;
  modalidadeAtendimento: string;
  nivelAtencao: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AtendimentoData {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId: string;
  profissionalNome: string;
  tipoAtendimento: string;
  nivelAtencao?: string;
  horaInicio: any; // Firestore Timestamp
  horaFim?: any; // Firestore Timestamp
}

export interface PacienteData {
  id: string;
  nomeCompleto: string;
  dataNascimento?: any; // Firestore Timestamp
  sexo?: 'Masculino' | 'Feminino';
  nivelAtencao?: 'AD I' | 'AD II' | 'AD III';
  status?: string;
  tipoCuidado?: string[];
}

export interface UsuarioData {
  id: string;
  nomeCompleto: string;
  cargo: string;
}
