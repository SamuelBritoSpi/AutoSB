import type { DemandProgress } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandProgressReportProps {
  progressList: DemandProgress[];
}

export default function DemandProgressReport({ progressList }: DemandProgressReportProps) {
  if (progressList.length === 0) {
    return <p style={{fontStyle: 'italic', textAlign: 'center', padding: '1rem'}}>Nenhum andamento registrado.</p>;
  }

  return (
    <div style={{marginTop: '1rem'}}>
      <h3 style={{fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Histórico de Andamento</h3>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd'}}>Data</th>
            <th style={{textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd'}}>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {progressList.map((progress) => (
            <tr key={progress.id}>
              <td style={{padding: '0.5rem', borderBottom: '1px solid #eee'}}>
                {format(parseISO(progress.date), "Pp", { locale: ptBR })}
              </td>
              <td style={{padding: '0.5rem', borderBottom: '1px solid #eee'}}>
                {progress.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}