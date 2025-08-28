
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileQuestion, Table as TableIcon, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// --- Funções de Cálculo de Horas ---

// Converte "HH:mm" para minutos totais a partir da meia-noite
const timeToMinutes = (timeStr: string): number => {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Calcula a diferença em minutos entre dois horários
const timeDifference = (start: string, end: string): number => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (endMinutes < startMinutes) return 0; // Não lida com turnos que viram a noite
  return endMinutes - startMinutes;
};

// Formata minutos totais de volta para "HH:mm"
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// --- Tipos de Dados ---
interface ProcessedTimeSheet {
    employeeName: string;
    totalHoursWorked: string; // HH:mm
    requiredHours: string; // Placeholder
    balance: string; // Placeholder
}


export default function TimeSheetTab() {
  const { toast } = useToast();
  const [processedData, setProcessedData] = useState<ProcessedTimeSheet[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para validar se uma string é um horário no formato HH:mm
  const isTimeFormat = (value: string) => value && /^\d{2}:\d{2}$/.test(value.trim());

  // Função para extrair os 4 horários de uma célula
  const extractTimeEntries = (cellValue: string): [string, string, string, string] => {
    if (!cellValue) return ["", "", "", ""];
    const parts = cellValue.split(/[\s\n,;]+/).filter(Boolean).map(p => p.trim());
    
    return [
      isTimeFormat(parts[0]) ? parts[0] : "",
      isTimeFormat(parts[1]) ? parts[1] : "",
      isTimeFormat(parts[2]) ? parts[2] : "",
      isTimeFormat(parts[3]) ? parts[3] : "",
    ];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ variant: 'destructive', title: 'Nenhum arquivo selecionado' });
      return;
    }
    
    setFileName(file.name);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data as string[][];
          
          if (rawData.length < 2) {
              throw new Error("O arquivo CSV parece estar vazio ou não tem linhas de dados.");
          }

          const header = rawData[0];
          const employeeNameColumnIndex = header.findIndex(h => h && (h.toLowerCase().includes('funcionário') || h.toLowerCase().includes('nome')));

          if (employeeNameColumnIndex === -1) {
            throw new Error("Não foi possível encontrar a coluna com os nomes dos funcionários. Verifique o cabeçalho da planilha.");
          }

          const data = rawData.slice(1).map(row => {
            const employeeName = row[employeeNameColumnIndex];
            if (!employeeName) return null; // Ignora linhas sem nome

            let totalMinutesForMonth = 0;

            header.forEach((day, index) => {
              if (!isNaN(parseInt(day, 10)) && index > employeeNameColumnIndex) {
                 const [entry1, exit1, entry2, exit2] = extractTimeEntries(row[index] || "");
                 if (entry1 && exit1 && entry2 && exit2) {
                    const morningMinutes = timeDifference(entry1, exit1);
                    const afternoonMinutes = timeDifference(entry2, exit2);
                    totalMinutesForMonth += morningMinutes + afternoonMinutes;
                 }
              }
            });

            return {
              employeeName,
              totalHoursWorked: minutesToTime(totalMinutesForMonth),
              requiredHours: 'A Calcular',
              balance: 'A Calcular',
            };
          }).filter((d): d is ProcessedTimeSheet => d !== null);

          setProcessedData(data);
          
          if (data.length === 0) {
             toast({ variant: 'destructive', title: 'Nenhum dado processado', description: 'Verifique se as linhas contêm nomes de funcionários e dados de ponto.' });
          } else {
             toast({ title: 'Cálculo Inicial Concluído!', description: `As horas totais trabalhadas foram calculadas para ${data.length} funcionários.` });
          }

        } catch (error) {
           toast({ variant: 'destructive', title: 'Erro ao Processar', description: (error as Error).message });
           setProcessedData([]);
        }
      },
      error: (error) => {
        toast({ variant: 'destructive', title: 'Erro na importação', description: error.message });
      }
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="mr-2" />
            Importar Folha de Ponto Mensal
          </CardTitle>
          <CardDescription>
            Exporte sua planilha do mês para o formato CSV. O sistema irá ler o arquivo, calcular as horas e exibir um resumo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center p-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />
            <Button size="lg" onClick={handleImportClick}>
                <UploadCloud className="mr-2" /> Selecionar Arquivo CSV
            </Button>
            {fileName && <p className="text-sm text-muted-foreground">Arquivo selecionado: {fileName}</p>}
        </CardContent>
      </Card>
      
      {processedData.length === 0 ? (
        <Alert variant="default">
            <FileQuestion className="h-4 w-4" />
            <AlertTitle>Próximos Passos</AlertTitle>
            <AlertDescription>
              Após importar sua planilha mensal, os resultados dos cálculos aparecerão aqui. O próximo passo será informar a carga horária exigida para cada funcionário para podermos calcular o saldo de horas.
            </AlertDescription>
        </Alert>
      ) : (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <TableIcon className="mr-2"/>
                    Resumo da Folha de Ponto
                  </CardTitle>
                  <CardDescription>
                    Esta é a análise inicial com base no arquivo importado.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Total de Horas Trabalhadas (Mês)</TableHead>
                            <TableHead>Carga Horária Exigida</TableHead>
                            <TableHead>Saldo (Excedente / Faltante)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedData.map((data, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{data.employeeName}</TableCell>
                                <TableCell>{data.totalHoursWorked}</TableCell>
                                <TableCell>{data.requiredHours}</TableCell>
                                <TableCell>{data.balance}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                 <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                        Os cálculos atuais consideram apenas dias com 4 marcações de ponto válidas. Casos como faltas, feriados, atestados ou dias com marcações incompletas ainda não foram tratados.
                    </AlertDescription>
                 </Alert>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
