
import type { Uniform } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UniformDeliveryTermProps {
  uniforms: Uniform[];
}

export default function UniformDeliveryTerm({ uniforms }: UniformDeliveryTermProps) {
  return (
    <ReportLayout title="Termo de Recebimento de Fardamento">
      <div style={{ padding: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
        <p style={{ textAlign: 'justify', marginBottom: '1.5rem', textIndent: '2rem' }}>
          Declaro, para os devidos fins, que estou recebendo do Núcleo Territorial de Educação 20 (NTE 20), localizado em Vitória da Conquista – Bahia, o fardamento e/ou equipamentos de proteção individual (EPI) listados abaixo, destinados ao uso exclusivo em minhas atividades laborais.
        </p>
        
        <p style={{ textAlign: 'justify', marginBottom: '2rem', textIndent: '2rem' }}>
          Estou ciente da minha responsabilidade pela guarda, conservação e uso adequado dos itens recebidos, comprometendo-me a utilizá-los conforme as normas de segurança e higiene da empresa.
        </p>

        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          {uniforms.map((u, idx) => (
            <div key={u.id} style={{ marginBottom: idx === uniforms.length - 1 ? 0 : '2rem', paddingBottom: idx === uniforms.length - 1 ? 0 : '1.5rem', borderBottom: idx === uniforms.length - 1 ? 'none' : '1px dashed #ccc' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#3F51B5' }}>{u.employeeName}</h2>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 1rem 0' }}>Colégio: <strong>{u.schoolName}</strong></p>
              
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Itens Entregues:</h3>
              <ul style={{ listStyle: 'square', paddingLeft: '1.5rem', margin: 0 }}>
                {u.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>
                    <strong>{item.quantity}x {item.name}</strong> - Tamanho: {item.size}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '4rem' }}>
          Vitória da Conquista - BA, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: '300px' }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>Assinatura do Recebedor</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '300px' }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>Responsável pela Entrega</p>
            </div>
          </div>
        </div>
      </div>
    </ReportLayout>
  );
}
