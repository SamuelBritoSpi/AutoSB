

export type DemandPriority = 'alta' | 'media' | 'baixa';

// O DemandStatus agora é uma string simples, já que os valores virão do banco.
export type OldDemandStatus = 
  | 'recebido'
  | 'em-analise'
  | 'aguardando-sec'
  | 'aguardando-csh'
  | 'aguardando-confianca'
  | 'aguardando-gestor'
  | 'resposta-recebida'
  | 'finalizado';

// Nova interface para os documentos de status
export interface DemandStatus {
  id: string;
  label: string;
  order: number; // Para manter uma ordem consistente
  icon: string; // Lucide icon name
}

export interface Demand {
  id: string;
  title: string; 
  description: string;
  priority: DemandPriority;
  dueDate: string; // ISO string for date
  status: string; // Armazena o 'label' do status
  ownerId?: string | null; // ID of the employee responsible for the demand
}

export interface Vacation {
  id:string;
  employeeName: string;
  startDate: string; // ISO string for date
  endDate: string; // ISO string for date
}

export type ContractType = 'efetivo' | 'reda' | 'terceirizado';

export interface Employee {
  id: string;
  name: string;
  contractType: ContractType;
  fcmTokens?: string[]; // For push notifications
}

export interface MedicalCertificate {
  id: string;
  employeeId: string;
  certificateDate: string; // ISO string for date
  days: number;
  isHalfDay: boolean; // para atestados de meio turno
  originalReceived: boolean; // para controle do recebimento do atestado original
  fileURL: string | null; // URL from Firebase Storage
}

// Tipos para Folha de Ponto
export interface TimeSheetEntry {
  employeeName: string;
  date: string; // "dd/MM/yyyy"
  entries: {
    entry1: string; // "HH:mm"
    exit1: string;
    entry2: string;
    exit2: string;
  };
  situation: string; // Ex: 'P', 'F', 'FE'
  justification?: string;
  totalHours: string; // "HH:mm"
}
