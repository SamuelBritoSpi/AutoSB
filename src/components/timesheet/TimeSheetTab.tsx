
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileQuestion, Table as TableIcon } from 'lucide-react';
import type { TimeSheetEntry } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Função para validar se uma string é um horário no formato HH:mm
const isTimeFormat = (value: string) => /^\d{2}:\d{2}$/.test(value.trim());

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


export default function TimeSheetTab() {
  const { toast } = useToast();
  const [timeSheetData, setTimeSheetData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ variant: 'destructive', title: 'Nenhum arquivo selecionado' });
      return;
    }
    
    setFileName(file.name);

    Papa.parse(file, {
      header: false, // As colunas são dinâmicas (dias do mês)
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data as string[][];
          console.log('Dados brutos do CSV:', rawData);

          // A primeira linha pode ser o cabeçalho, vamos identificá-lo
          const header = rawData[0];
          const employeeNameColumnIndex = header.findIndex(h => h.toLowerCase().includes('funcionário') || h.toLowerCase().includes('nome'));

          if (employeeNameColumnIndex === -1) {
            throw new Error("Não foi possível encontrar a coluna com os nomes dos funcionários. Verifique o cabeçalho da planilha.");
          }

          const processedData = rawData.slice(1).map(row => {
            const employeeName = row[employeeNameColumnIndex];
            if (!employeeName) return null; // Ignora linhas sem nome de funcionário

            const dailyEntries: Record<string, string[]> = {};
            header.forEach((day, index) => {
              // Considera colunas que são apenas números como dias
              if (!isNaN(parseInt(day, 10)) && index > employeeNameColumnIndex) {
                 const [entry1, exit1, entry2, exit2] = extractTimeEntries(row[index] || "");
                 dailyEntries[day] = [entry1, exit1, entry2, exit2];
              }
            });

            return {
              employeeName,
              dailyEntries
            };
          }).filter(Boolean); // Remove linhas nulas

          console.log("Dados Processados:", processedData);

          setTimeSheetData(processedData);

          if (processedData.length === 0) {
             toast({ variant: 'destructive', title: 'Nenhum dado processado', description: 'Verifique o formato do seu arquivo CSV e se ele contém dados.' });
          } else if (results.errors.length > 0) {
             toast({ variant: 'destructive', title: 'Erro ao ler o arquivo', description: 'Algumas linhas podem não ter sido importadas corretamente.' });
          } else {
             toast({ title: 'Arquivo Importado!', description: `${file.name} foi lido. Agora, precisamos aplicar as regras de cálculo.` });
          }
        } catch (error) {
           toast({ variant: 'destructive', title: 'Erro ao Processar', description: (error as Error).message });
           setTimeSheetData([]);
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
            Exporte sua planilha do mês para o formato CSV. Em seguida, importe o arquivo aqui para que o sistema possa processar os dados.
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
      
      {timeSheetData.length === 0 ? (
        <Alert variant="default">
            <FileQuestion className="h-4 w-4" />
            <AlertTitle>Próximos Passos</AlertTitle>
            <AlertDescription>
              Após importar a planilha mensal, os dados processados aparecerão abaixo. O próximo passo será implementar as regras de cálculo para horas trabalhadas, horas devidas e horas excedentes.
            </AlertDescription>
        </Alert>
      ) : (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <TableIcon className="mr-2"/>
                    Dados Importados da Planilha
                  </CardTitle>
                  <CardDescription>
                    Esta é uma visualização dos dados lidos. O próximo passo é aplicar as regras de cálculo.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Registros de Ponto (Dia 1)</TableHead>
                             <TableHead>Registros de Ponto (Dia 2)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {timeSheetData.slice(0, 5).map((data, index) => ( // Mostra apenas os 5 primeiros como exemplo
                            <TableRow key={index}>
                                <TableCell>{data.employeeName}</TableCell>
                                <TableCell>{JSON.stringify(data.dailyEntries['1'] || [])}</TableCell>
                                <TableCell>{JSON.stringify(data.dailyEntries['2'] || [])}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
