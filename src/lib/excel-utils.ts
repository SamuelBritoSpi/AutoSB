import * as XLSX from 'xlsx';
import type { ThirdPartyEmployee, School, ThirdPartyHistoryEntry } from './types';
import { normalizeForComparison } from './utils';

/**
 * Processa um arquivo Excel de Terceirizados conforme as colunas específicas do usuário.
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
          // Normalização de chaves da linha (ignora maiúsculas/minúsculas e acentos)
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.toUpperCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, ' ')
              .trim();
            normalizedRow[normalizedKey] = row[key];
          });

          // 1. Normalização de CPF (11 dígitos)
          const rawCpf = String(normalizedRow['CPF'] || '').replace(/\D/g, '');
          const formattedCpf = rawCpf ? rawCpf.padStart(11, '0') : '';

          // 2. Lógica de Prioridade (Atualizado vs Antigo)
          const lotacaoAntiga = String(normalizedRow['LOTACAO'] || '').trim();
          const lotacaoNova = String(normalizedRow['LOTACAO ATUALIZADA'] || '').trim();
          const finalSchoolName = lotacaoNova || lotacaoAntiga || 'Não Informado';

          const codSecAntigo = String(normalizedRow['COD SEC'] || '').trim();
          const codSecNovo = String(normalizedRow['COD SEC2'] || '').trim();
          const finalCodSec = codSecNovo || codSecAntigo || '';

          const contatoAntigo = String(normalizedRow['CONTATO'] || '').trim();
          const contatoNovo = String(normalizedRow['CONTATO ATUALIZADO'] || '').trim();
          const finalContact = contatoNovo || contatoAntigo || '';

          // 3. Município (Tratamento de múltiplas variações de nome de coluna)
          const municipio = normalizedRow['MUNICIPIO LOTACAO'] || 
                            normalizedRow['MUNICIPIO'] || 
                            normalizedRow['MUNICIPIO DE LOTACAO'] || '';

          // 4. Montagem do Histórico
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

          // 5. Mapeamento de Escola Robusto (Fuzzy Match)
          const normalizedSearchName = normalizeForComparison(finalSchoolName);
          const school = schools.find(s => normalizeForComparison(s.name) === normalizedSearchName);

          // 6. Data de Admissão
          let admissionDate = new Date().toISOString();
          if (normalizedRow['DATA DE ADMISSAO']) {
            const d = new Date(normalizedRow['DATA DE ADMISSAO']);
            if (!isNaN(d.getTime())) {
              admissionDate = d.toISOString();
            }
          }

          // 7. Captura de Dados Extras (Tudo que não foi mapeado explicitamente)
          const standardKeys = [
            'NTE', 'MUNICIPIO LOTACAO', 'MUNICIPIO', 'MUNICIPIO DE LOTACAO', 'LOTACAO', 
            'COD SEC', 'LOTACAO ATUALIZADA', 'COD SEC2', 'NOME', 'CPF', 'FUNCAO', 
            'CONTATO', 'CONTATO ATUALIZADO', 'CONTRATO ATUAL', 'EMPRESA', 'STATUS', 
            'DATA DE ADMISSAO', 'OBSERVACAO'
          ];
          
          const extraData: Record<string, any> = {};
          Object.keys(normalizedRow).forEach(key => {
            if (!standardKeys.includes(key)) {
              extraData[key] = normalizedRow[key];
            }
          });

          return {
            nte: String(normalizedRow['NTE'] || 'NTE 20'),
            municipio: String(municipio).trim(),
            schoolId: school?.id || 'importado',
            schoolName: school?.name || finalSchoolName,
            codSec: finalCodSec,
            name: String(normalizedRow['NOME'] || ''),
            cpf: formattedCpf,
            role: String(normalizedRow['FUNCAO'] || ''),
            contact: finalContact,
            company: String(normalizedRow['EMPRESA'] || '').toUpperCase().includes('CSH') ? 'CSH' : 'CONFIANÇA',
            status: String(normalizedRow['STATUS'] || 'Ativo'),
            admissionDate: admissionDate,
            observation: String(normalizedRow['OBSERVACAO'] || ''),
            contractType: String(normalizedRow['CONTRATO ATUAL'] || ''),
            history: history,
            extraData: Object.keys(extraData).length > 0 ? extraData : undefined
          };
        });

        // Filtra linhas vazias ou inválidas
        resolve(employees.filter(e => e.name && e.name.length > 2));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
