
"use client";

import React, { useState, useCallback, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileQuestion, Table as TableIcon, AlertTriangle, Calculator } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// --- Funções de Cálculo de Horas ---

const timeToMinutes = (timeStr: string): number => {
  if (!/^\d{1,2}:\d{2}$/.test(timeStr)) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
};

const timeDifference = (start: string, end: string): number => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (endMinutes < startMinutes) return 0; // Não lida com turnos que viram a noite
  return endMinutes - startMinutes;
};

const minutesToTime = (totalMinutes: number): string => {
  if (isNaN(totalMinutes)) return "00:00";
  const sign = totalMinutes < 0 ? "-" : "";
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// --- Tipos de Dados ---
interface RawTimeSheetData {
    employeeName: string;
    totalMinutesWorked: number;
}
interface ProcessedTimeSheet extends RawTimeSheetData {
    weeklyHours: number;
    requiredMinutes: number;
    balanceMinutes: number;
}

export default function TimeSheetTab() {
  const { toast } = useToast();
  const [rawData, setRawData] = useState<RawTimeSheetData[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [workingDays, setWorkingDays] = useState<number>(20);
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [employeeWeeklyHours, setEmployeeWeeklyHours] = useState<Record<string, number>>({});


  const isTimeFormat = (value: string) => value && /^\d{1,2}:\d{2}$/.test(value.trim());

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
    setRawData([]);
    setEmployeeWeeklyHours({});

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const csvData = results.data as string[][];
          
          if (csvData.length < 2) {
              throw new Error("O arquivo CSV parece estar vazio ou não tem linhas de dados.");
          }

          const header = csvData[0];
          const employeeNameColumnIndex = header.findIndex(h => h && (h.toLowerCase().includes('funcionário') || h.toLowerCase().includes('nome')));

          if (employeeNameColumnIndex === -1) {
            throw new Error("Não foi possível encontrar a coluna com os nomes dos funcionários ('Funcionário' ou 'Nome').");
          }

          const data: RawTimeSheetData[] = csvData.slice(1).map(row => {
            const employeeName = row[employeeNameColumnIndex];
            if (!employeeName) return null;

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
              totalMinutesWorked: totalMinutesForMonth,
            };
          }).filter((d): d is RawTimeSheetData => d !== null);

          setRawData(data);
          
          if (data.length === 0) {
             toast({ variant: 'destructive', title: 'Nenhum dado processado', description: 'Verifique se as linhas contêm nomes de funcionários e dados de ponto.' });
          } else {
             toast({ title: 'Cálculo Inicial Concluído!', description: `As horas totais trabalhadas foram calculadas para ${data.length} funcionários.` });
          }

        } catch (error) {
           toast({ variant: 'destructive', title: 'Erro ao Processar', description: (error as Error).message });
           setRawData([]);
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

  const processedData: ProcessedTimeSheet[] = useMemo(() => {
    const requiredMinutesPerDay = dailyHours * 60;
    
    return rawData.map(employeeData => {
        const weeklyHours = employeeWeeklyHours[employeeData.employeeName] || (dailyHours * 5);
        const dailyMinutesFromWeekly = (weeklyHours / 5) * 60;
        const requiredMinutes = workingDays * dailyMinutesFromWeekly;

        return {
            ...employeeData,
            weeklyHours: weeklyHours,
            requiredMinutes: requiredMinutes,
            balanceMinutes: employeeData.totalMinutesWorked - requiredMinutes,
        };
    });
  }, [rawData, workingDays, dailyHours, employeeWeeklyHours]);

  const handleWeeklyHoursChange = (employeeName: string, hours: string) => {
    const numHours = parseInt(hours, 10);
    setEmployeeWeeklyHours(prev => ({
        ...prev,
        [employeeName]: isNaN(numHours) ? 0 : numHours
    }));
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
              Após importar sua planilha mensal, os resultados dos cálculos aparecerão aqui. Informe a carga horária e os dias úteis para calcular o saldo de horas.
            </AlertDescription>
        </Alert>
      ) : (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="mr-2"/>
                    Calcular Saldo de Horas
                  </CardTitle>
                  <CardDescription>
                    Ajuste os parâmetros abaixo para calcular a carga horária exigida e o saldo final de cada funcionário.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50'>
                    <div>
                        <Label htmlFor="working-days">Dias Úteis no Mês</Label>
                        <Input 
                            id="working-days" 
                            type="number" 
                            value={workingDays} 
                            onChange={(e) => setWorkingDays(Number(e.target.value))} 
                        />
                    </div>
                    <div>
                        <Label htmlFor="daily-hours">Carga Horária Diária Padrão</Label>
                        <Input 
                            id="daily-hours" 
                            type="number" 
                            value={dailyHours}
                            onChange={(e) => setDailyHours(Number(e.target.value))}
                        />
                    </div>
                </div>

                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Horas Trabalhadas</TableHead>
                            <TableHead className='w-[150px]'>C.H. Semanal</TableHead>
                            <TableHead>C.H. Exigida (Mês)</TableHead>
                            <TableHead>Saldo (Exced/Falt)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedData.map((data) => (
                            <TableRow key={data.employeeName}>
                                <TableCell className="font-medium">{data.employeeName}</TableCell>
                                <TableCell>{minutesToTime(data.totalMinutesWorked)}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        placeholder={`${dailyHours * 5}`}
                                        className="h-8"
                                        value={employeeWeeklyHours[data.employeeName] || ''}
                                        onChange={(e) => handleWeeklyHoursChange(data.employeeName, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>{minutesToTime(data.requiredMinutes)}</TableCell>
                                <TableCell className={data.balanceMinutes >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                  {minutesToTime(data.balanceMinutes)}
                                </TableCell>
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
    