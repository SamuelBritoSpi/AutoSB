
import React, { useEffect, useState } from 'react';
import type { Demand, Employee, DemandStatus, DemandProgress } from '@/lib/types';
import { getDemandProgressByDemandId } from '@/lib/idb';
import DemandProgressReport from './DemandProgressReport';
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
  const [progressData, setProgressData] = useState<Record<string, DemandProgress[]>>({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoadingProgress(true);
      const progressMap: Record<string, DemandProgress[]> = {};
      
      for (const demand of demands) {
        try {
          const progress = await getDemandProgressByDemandId(demand.id);
          progressMap[demand.id] = progress;
        } catch (error) {
          console.error(`Erro ao buscar andamento para demanda ${demand.id}:`, error);
          progressMap[demand.id] = [];
        }
      }
      
      setProgressData(progressMap);
      setLoadingProgress(false);
    };

    if (demands.length > 0) {
      fetchProgressData();
    } else {
      setLoadingProgress(false);
    }
  }, [demands]);
  
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
                          <tr>
                              <td>{demand.title}</td>
                              <td>{getEmployeeName(demand.ownerId)}</td>
                              <td>{priorityMap[demand.priority]}</td>
                              <td>{demand.status}</td>
                              <td>{format(parseISO(demand.dueDate), "P", { locale: ptBR })}</td>
                          </tr>
                          {/* Linha para o histórico de andamento */}
                          <tr>
                              <td colSpan={5} style={{padding: '0 1rem 1rem 2rem', backgroundColor: '#f9f9f9'}}>
                                {loadingProgress ? (
                                  <p style={{fontStyle: 'italic', textAlign: 'center'}}>Carregando histórico...</p>
                                ) : (
                                  <DemandProgressReport progressList={progressData[demand.id] || []} />
                                )}
                              </td>
                          </tr>
                        </React.Fragment>
                    ))
            ) : (
                <tr>
                    <td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>Nenhuma demanda encontrada para os filtros selecionados.</td>
                </tr>
            )}
            </tbody>
      </table>
    </ReportLayout>
  );
}
