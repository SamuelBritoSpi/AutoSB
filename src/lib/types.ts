
export type DemandPriority = 'alta' | 'media' | 'baixa';
export type DemandStatus = 
  | 'recebido'
  | 'em-analise'
  | 'aguardando-sec'
  | 'aguardando-csh'
  | 'aguardando-confianca'
  | 'aguardando-gestor'
  | 'resposta-recebida'
  | 'finalizado';

export interface Demand {
  id: string;
  title: string; 
  description: string;
  priority: DemandPriority;
  dueDate: string; // ISO string for date
  status: DemandStatus;
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
}

export interface MedicalCertificate {
  id: string;
  employeeId: string;
  certificateDate: string; // ISO string for date
  days: number;
  isHalfDay: boolean; // para atestados de meio turno
  originalReceived: boolean; // para controle do recebimento do atestado original
  fileDataUri: string | null; // Base64 encoded file
}
