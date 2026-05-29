
import * as XLSX from 'xlsx';
import type { ThirdPartyEmployee, School, ThirdPartyHistoryEntry } from './types';

/**
 * Processa um arquivo Excel de Terceirizados conforme as colunas específicas do usuário.
 * Colunas esperadas: NTE, MUNICÍPIO LOTAÇÃO, LOTAÇÃO, COD SEC, LOTAÇÃO ATUALIZADA, COD SEC2, 
 * NOME, CPF, FUNÇÃO, CONTATO, CONTATO ATUALIZADO, CONTRATO ATUAL, EMPRESA, STATUS, DATA DE ADMISSÃO, OBSERVAÇÃO.
 */
export async function parseEmployeesExcel(file: File, schools: School[]): Promise<Omit<ThirdPartyEmployee, 'id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const employees: Omit<ThirdPartyEmployee, 'id'>[] = jsonData.map(row => {
          // 1. Normalização de CPF (11 dígitos com zeros à esquerda)
          const rawCpf = String(row['CPF'] || '').replace(/\D/g, '');
          const formattedCpf = rawCpf ? rawCpf.padStart(11, '0') : '';

          // 2. Lógica de Prioridade (Atualizado vs Antigo)
          const lotacaoAntiga = String(row['LOTAÇÃO'] || '').trim();
          const lotacaoNova = String(row['LOTAÇÃO ATUALIZADA'] || '').trim();
          const finalSchoolName = lotacaoNova || lotacaoAntiga || 'Não Informado';

          const codSecAntigo = String(row['COD SEC'] || '').trim();
          const codSecNovo = String(row['COD SEC2'] || '').trim();
          const finalCodSec = codSecNovo || codSecAntigo || '';

          const contatoAntigo = String(row['CONTATO'] || '').trim();
          const contatoNovo = String(row['CONTATO ATUALIZADO'] || '').trim();
          const finalContact = contatoNovo || contatoAntigo || '';

          // 3. Montagem do Histórico Inicial se houver dados "antigos" diferentes dos "novos"
          const history: ThirdPartyHistoryEntry[] = [];
          const now = new Date().toISOString();

          if (lotacaoNova && lotacaoAntiga && lotacaoNova !== lotacaoAntiga) {
            history.push({ date: now, field: 'Lotação', oldValue: lotacaoAntiga, newValue: lotacaoNova });
          }
          if (codSecNovo && codSecAntigo && codSecNovo !== codSecAntigo) {
            history.push({ date: now, field: 'COD SEC', oldValue: codSecAntigo, newValue: codSecNovo });
          }
          if (contatoNovo && contatoAntigo && contatoNovo !== contatoAntigo) {
            history.push({ date: now, field: 'Contato', oldValue: contatoAntigo, newValue: contatoNovo });
          }

          // 4. Mapeamento de Escola por nome para obter ID
          const school = schools.find(s => s.name.toLowerCase() === finalSchoolName.toLowerCase());

          // 5. Data de Admissão (Tratamento Excel)
          let admissionDate = new Date().toISOString();
          if (row['DATA DE ADMISSÃO']) {
            const d = new Date(row['DATA DE ADMISSÃO']);
            if (!isNaN(d.getTime())) {
              admissionDate = d.toISOString();
            }
          }

          return {
            nte: String(row['NTE'] || 'NTE 20'),
            municipio: String(row['MUNICÍPIO LOTAÇÃO'] || ''),
            schoolId: school?.id || 'importado',
            schoolName: finalSchoolName,
            codSec: finalCodSec,
            name: String(row['NOME'] || ''),
            cpf: formattedCpf,
            role: String(row['FUNÇÃO'] || ''),
            contact: finalContact,
            company: String(row['EMPRESA'] || '').toUpperCase().includes('CSH') ? 'CSH' : 'CONFIANÇA',
            status: String(row['STATUS'] || 'Ativo'),
            admissionDate: admissionDate,
            observation: String(row['OBSERVAÇÃO'] || ''),
            contractType: String(row['CONTRATO ATUAL'] || ''),
            history: history,
          };
        });

        resolve(employees.filter(e => e.name && e.name !== 'undefined' && e.name.length > 2));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
