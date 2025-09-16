import type { DemandProgress } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandProgressReportProps {
  progressList: DemandProgress[];
}

export default function DemandProgressReport({ progressList }: DemandProgressReportProps) {
  if (progressList.length === 0) {
    return (
      <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px'}}>
        <p style={{fontStyle: 'italic', textAlign: 'center', margin: '0', color: '#6c757d'}}>
          Nenhum histórico de andamento registrado para esta demanda.
        </p>
      </div>
    );
  }

  return (
    <div style={{marginTop: '1rem'}}>
      <h3 style={{fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#495057'}}>Histórico de Andamento</h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: '600'}}>Data</th>
            <th style={{textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: '600'}}>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {progressList.map((progress, index) => (
            <tr key={progress.id} style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'}}>
              <td style={{padding: '0.75rem 0.5rem', borderBottom: '1px solid #dee2e6', verticalAlign: 'top', minWidth: '150px'}}>
                {format(parseISO(progress.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </td>
              <td style={{padding: '0.75rem 0.5rem', borderBottom: '1px solid #dee2e6', wordWrap: 'break-word'}}>
                {progress.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}