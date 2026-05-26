
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
  icon: string; // Nome do ícone Lucide
  color: string; // Classe CSS do Tailwind, ex: 'text-blue-500'
}

// Interface para o histórico de andamento das demandas
export interface DemandProgress {
  id: string;
  demandId: string; // ID da demanda relacionada
  description: string; // Descrição da atualização
  date: string; // String ISO para data
  createdBy?: string | null; // ID do usuário que criou a atualização
}

export interface Demand {
  id: string;
  title: string; 
  description: string;
  priority: DemandPriority;
  dueDate: string; // String ISO para data
  status: string; // Armazena o 'label' do status
  ownerId?: string | null; // ID do funcionário responsável pela demanda
}

export type AbsenceType = 'ferias' | 'licenca_premio' | 'licenca_medica' | 'licenca_maternidade';
export type AbsenceStatus = 'planejado' | 'confirmado' | 'cancelado';


export interface Vacation {
  id:string;
  employeeId: string; // Vínculo com o Funcionário
  employeeName: string; // Denormalizado para fácil exibição
  startDate: string; // String ISO para data
  endDate: string; // String ISO para data
  type: AbsenceType;
  status: AbsenceStatus; // 'planejado', 'confirmado', 'cancelado'
  notes?: string; // Observações/detalhes sobre o agendamento
}

export type ContractType = 'efetivo' | 'reda' | 'terceirizado';

export interface Employee {
  id: string;
  name: string;
  contractType: ContractType;
  fcmTokens?: string[]; // Para notificações push
}

export interface MedicalCertificate {
  id: string;
  employeeId: string;
  certificateDate: string; // String ISO para data
  days: number;
  isHalfDay: boolean; // para atestados de meio turno
  originalReceived: boolean; // para controle do recebimento do atestado original
  fileURL: string | null; // URL do Firebase Storage
  cid?: string; // Código da Classificação Internacional de Doenças
}

export interface JustifiedAbsence {
  id: string;
  employeeId: string;
  employeeName: string; // Denormalizado para fácil exibição
  startDate: string; // String ISO para data
  endDate: string; // String ISO para data
  reason: string; // Motivo da falta justificada
  status: 'active' | 'cancelled'; // Status da falta
}

export type CardStatus = 'pending' | 'delivered';

export interface Card {
  id: string;
  recipientName: string;
  schoolId?: string; // ID do colégio onde trabalha
  schoolName?: string; // Nome denormalizado para relatórios
  status: CardStatus;
  arrivalDate: string; // Data de chegada do cartão
  deliveryDate?: string | null; // Data de entrega ao destinatário
}

// --- Fardamento ---

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
  schoolName: string; // Denormalizado
  arrivalDate: string;
  deliveryDate?: string | null;
  status: 'pending' | 'delivered';
  items: UniformItem[];
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
