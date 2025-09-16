
import React from 'react';
import type { Demand, Employee, DemandStatus } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandsReportProps {
  demands: Demand[];
  employees: Employee[];
  demandStatuses: DemandStatus[];
  filters: {
    dateRange: { from?: Date; to?: Date };
    employeeId: string;
    status: string;
  };
}

export default function DemandsReport({ demands, employees, demandStatuses, filters }: DemandsReportProps) {
  const getEmployeeName = (id?: string | null) => employees.find(e => e.id === id)?.name || 'N/A';
  
  const formatDate = (date?: Date) => date ? format(date, "P", { locale: ptBR }) : 'N/A';

  const filterSummary = [
    `Período: De ${formatDate(filters.dateRange.from)} a ${formatDate(filters.dateRange.to)}`,
    `Status: ${filters.status === 'all' ? 'Todos' : filters.status}`,
    `Demandas: ${demands.length}`
  ].join(' | ');

  const priorityMap = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  return (
    <ReportLayout title="Relatório de Demandas">
        <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem'}}><strong>Filtros Aplicados:</strong> {filterSummary}</p>
        <table>
            <thead>
            <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Data de Entrega</th>
            </tr>
            </thead>
            <tbody>
            {demands.length > 0 ? (
                demands
                    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map(demand => (
                        <React.Fragment key={demand.id}>
                          <tr style={{borderBottom: '1px solid #dee2e6'}}>
                              <td style={{padding: '0.75rem', verticalAlign: 'top', fontWeight: '500'}}>{demand.title}</td>
                              <td style={{padding: '0.75rem', maxWidth: '250px', wordWrap: 'break-word', lineHeight: '1.4', verticalAlign: 'top'}}>{demand.description}</td>
                              <td style={{padding: '0.75rem', verticalAlign: 'top'}}>{getEmployeeName(demand.ownerId)}</td>
                              <td style={{padding: '0.75rem', verticalAlign: 'top'}}>{priorityMap[demand.priority]}</td>
                              <td style={{padding: '0.75rem', verticalAlign: 'top'}}>{demand.status}</td>
                              <td style={{padding: '0.75rem', verticalAlign: 'top', whiteSpace: 'nowrap'}}>{format(parseISO(demand.dueDate), "dd/MM/yyyy", { locale: ptBR })}</td>
                          </tr>
                        </React.Fragment>
                    ))
            ) : (
                <tr>
                    <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Nenhuma demanda encontrada para os filtros selecionados.</td>
                </tr>
            )}
            </tbody>
      </table>
    </ReportLayout>
  );
}
