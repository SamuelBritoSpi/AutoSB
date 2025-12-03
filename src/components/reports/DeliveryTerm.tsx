
import type { Card } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveryTermProps {
  cards: Card[];
}

export default function DeliveryTerm({ cards }: DeliveryTermProps) {
  return (
    <ReportLayout title="Termo de Entrega">
      <div style={{ padding: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
        <p style={{ textAlign: 'justify', marginBottom: '1rem', textIndent: '2rem' }}>
          Declaro, para os devidos fins, que estou realizando a retirada do(s) cartão(ões) alimentação fornecido(s) pela empresa Le Card, destinado(s) aos colaboradores das empresas terceirizadas vinculadas. A retirada ocorre nas dependências do Núcleo Territorial de Educação 20 (NTE 20), localizado em Vitória da Conquista – Bahia.
        </p>
        <p style={{ textAlign: 'justify', marginBottom: '2rem', textIndent: '2rem' }}>
          Estou ciente de que assumo total responsabilidade pela posse e pela entrega do(s) referido(s) cartão(ões) ao(s) beneficiário(s) correspondente(s), conforme autorização prévia.
        </p>

        <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          Cartões Retirados
        </h2>
        <ul style={{ listStyle: 'decimal', paddingLeft: '2rem', marginBottom: '3rem' }}>
          {cards.map(card => (
            <li key={card.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{card.recipientName}</strong>
            </li>
          ))}
        </ul>

        <p style={{ textAlign: 'center', marginBottom: '5rem' }}>
          Vitória da Conquista - BA, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
        </p>

        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '350px', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>Assinatura do Responsável</p>
          </div>
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '350px', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>CPF do Responsável</p>
          </div>
        </div>
      </div>
    </ReportLayout>
  );
}
