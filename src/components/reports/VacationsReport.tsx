
import type { Vacation } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationsReportProps {
  vacations: Vacation[];
  filters: {
    dateRange: { from?: Date; to?: Date };
    employeeId: string;
  };
}

const absenceTypeMap = {
    ferias: 'Férias',
    licenca_premio: 'Licença Prêmio',
    licenca_medica: 'Licença Médica',
    licenca_maternidade: 'Licença Maternidade',
};

const absenceStatusMap = {
    planejado: 'Planejado',
    confirmado: 'Usufruído',
    cancelado: 'Não Usufruído',
};

export default function VacationsReport({ vacations, filters }: VacationsReportProps) {
  
  const formatDate = (date?: Date) => date ? format(date, "P", { locale: ptBR }) : 'N/A';

  const filterSummary = [
    `Período: De ${formatDate(filters.dateRange.from)} a ${formatDate(filters.dateRange.to)}`,
    `Funcionário: ${filters.employeeId === 'all' ? 'Todos' : vacations.find(v => v.employeeId === filters.employeeId)?.employeeName || 'Desconhecido'}`
  ].join(' | ');

  const groupedByEmployee = vacations.reduce((acc, vacation) => {
    (acc[vacation.employeeName] = acc[vacation.employeeName] || []).push(vacation);
    return acc;
  }, {} as Record<string, Vacation[]>);


  return (
    <ReportLayout title="Relatório de Afastamentos">
        <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem'}}><strong>Filtros Aplicados:</strong> {filterSummary}</p>
        
        {Object.keys(groupedByEmployee).sort().map(employeeName => (
            <div key={employeeName}>
                <h2>{employeeName}</h2>
                 <table>
                    <thead>
                        <tr>
                            <th>Tipo de Afastamento</th>
                            <th>Status</th>
                            <th>Data de Início</th>
                            <th>Data de Término</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedByEmployee[employeeName]
                            .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                            .map(vacation => (
                            <tr key={vacation.id}>
                                <td>{absenceTypeMap[vacation.type]}</td>
                                <td>{absenceStatusMap[vacation.status]}</td>
                                <td>{format(parseISO(vacation.startDate), "P", { locale: ptBR })}</td>
                                <td>{format(parseISO(vacation.endDate), "P", { locale: ptBR })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}

        {Object.keys(groupedByEmployee).length === 0 && (
            <table>
                <tbody>
                    <tr>
                        <td style={{textAlign: 'center', padding: '2rem'}}>Nenhum afastamento encontrado para os filtros selecionados.</td>
                    </tr>
                </tbody>
            </table>
        )}
    </ReportLayout>
  );
}
