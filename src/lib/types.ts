export type DemandPriority = 'alta' | 'media' | 'baixa';
export type DemandStatus = 'a-fazer' | 'em-progresso' | 'concluida';

export interface Demand {
  id: string;
  title: string; // Novo campo para o título da demanda
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
