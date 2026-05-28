
import * as XLSX from 'xlsx';
import type { ThirdPartyEmployee, School } from './types';

/**
 * Processa um arquivo Excel e retorna uma lista de funcionários terceirizados.
 * Identifica colunas mapeadas e agrupa as extras em 'extraData'.
 */
export async function parseEmployeesExcel(file: File, schools: School[]): Promise<Omit<ThirdPartyEmployee, 'id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const employees: Omit<ThirdPartyEmployee, 'id'>[] = jsonData.map(row => {
          const lotacao = String(row['Lotação'] || row['LOTACAO'] || row['Escola'] || '').trim();
          const school = schools.find(s => s.name.toLowerCase() === lotacao.toLowerCase());

          // Lista de chaves que já mapeamos manualmente
          const mappedKeys = [
            'Lotação', 'LOTACAO', 'Escola', 'NTE', 'Município', 'MUNICIPIO', 
            'COD.sec', 'CODSEC', 'Nome completo', 'NOME', 'CPF', 
            'Função', 'FUNCAO', 'Contato', 'TELEFONE', 'Empresa', 
            'Status', 'Data de admissão', 'Observação', 'OBS'
          ];

          // Captura colunas extras
          const extraData: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            if (!mappedKeys.includes(key)) {
              extraData[key] = row[key];
            }
          });

          return {
            nte: String(row['NTE'] || 'NTE 20'),
            municipio: String(row['Município'] || row['MUNICIPIO'] || ''),
            schoolId: school?.id || 'importado',
            schoolName: lotacao || 'Não Informado',
            codSec: String(row['COD.sec'] || row['CODSEC'] || ''),
            name: String(row['Nome completo'] || row['NOME'] || ''),
            cpf: String(row['CPF'] || '').replace(/\D/g, ''),
            role: String(row['Função'] || row['FUNCAO'] || ''),
            contact: String(row['Contato'] || row['TELEFONE'] || ''),
            company: String(row['Empresa'] || '').toUpperCase().includes('CSH') ? 'CSH' : 'CONFIANÇA',
            status: String(row['Status'] || 'Ativo'),
            admissionDate: row['Data de admissão'] ? new Date(row['Data de admissão']).toISOString() : new Date().toISOString(),
            observation: String(row['Observação'] || row['OBS'] || ''),
            extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
          };
        });

        resolve(employees.filter(e => e.name && e.name !== 'undefined'));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
