
export type DemandPriority = 'alta' | 'media' | 'baixa';

export interface DemandStatus {
  id: string;
  label: string;
  order: number; 
  icon: string; 
  color: string; 
}

export interface DemandProgress {
  id: string;
  demandId: string; 
  description: string;
  date: string; 
  createdBy?: string | null;
}

export interface Demand {
  id: string;
  title: string; 
  description: string;
  priority: DemandPriority;
  dueDate: string; 
  status: string; 
  ownerId?: string | null;
}

export type AbsenceType = 'ferias' | 'licenca_premio' | 'licenca_medica' | 'licenca_maternidade';
export type AbsenceStatus = 'planejado' | 'confirmado' | 'cancelado';

export interface Vacation {
  id:string;
  employeeId: string; 
  employeeName: string; 
  startDate: string; 
  endDate: string; 
  type: AbsenceType;
  status: AbsenceStatus; 
  notes?: string;
}

export type ContractType = 'efetivo' | 'reda' | 'terceirizado';

export interface Employee {
  id: string;
  name: string;
  contractType: ContractType;
  fcmTokens?: string[];
}

export type ThirdPartyCompany = 'CONFIANÇA' | 'CSH';

export interface ThirdPartyHistoryEntry {
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface ThirdPartyEmployee {
  id: string;
  nte: string;
  municipio: string;
  schoolId: string; 
  schoolName: string; 
  codSec: string;
  name: string;
  cpf: string;
  role: string;
  contact: string;
  company: ThirdPartyCompany;
  status: string;
  admissionDate: string;
  observation: string;
  contractType?: string; // Coluna "CONTRATO ATUAL"
  history: ThirdPartyHistoryEntry[];
  extraData?: Record<string, any>;
}

export interface MedicalCertificate {
  id: string;
  employeeId: string;
  certificateDate: string; 
  days: number;
  isHalfDay: boolean; 
  originalReceived: boolean; 
  fileURL: string | null; 
  cid?: string; 
}

export interface JustifiedAbsence {
  id: string;
  employeeId: string;
  employeeName: string; 
  startDate: string; 
  endDate: string; 
  reason: string; 
  status: 'active' | 'cancelled';
}

export type CardStatus = 'pending' | 'delivered';

export interface Card {
  id: string;
  recipientName: string;
  schoolId?: string; 
  schoolName?: string; 
  status: CardStatus;
  arrivalDate: string; 
  deliveryDate?: string | null;
}

export interface School {
  id: string;
  name: string;
}

export interface UniformItem {
  name: string;
  quantity: number;
  size: string;
}

export interface Uniform {
  id: string;
  employeeName: string;
  schoolId: string;
  schoolName: string; 
  arrivalDate: string;
  deliveryDate?: string | null;
  status: 'pending' | 'delivered';
  items: UniformItem[];
}

export interface TimeSheetEntry {
  employeeName: string;
  date: string; 
  entries: {
    entry1: string; 
    exit1: string;
    entry2: string;
    exit2: string;
  };
  situation: string; 
  justification?: string;
  totalHours: string; 
}
