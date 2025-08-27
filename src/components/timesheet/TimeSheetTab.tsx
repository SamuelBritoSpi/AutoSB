
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileQuestion } from 'lucide-react';
import type { TimeSheetEntry } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function TimeSheetTab() {
  const { toast } = useToast();
  const [timeSheetData, setTimeSheetData] = useState<TimeSheetEntry[]>([]);
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
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // AQUI ENTRARÁ A LÓGICA DE PROCESSAMENTO BASEADA NAS SUAS REGRAS
        console.log('Dados brutos do CSV:', results.data);

        // Lógica de placeholder - será substituída
        const processedData: TimeSheetEntry[] = []; 
        
        setTimeSheetData(processedData);

        if (results.errors.length > 0) {
           toast({ variant: 'destructive', title: 'Erro ao ler o arquivo', description: 'Algumas linhas podem não ter sido importadas corretamente.' });
        } else {
           toast({ title: 'Arquivo Importado!', description: `${file.name} foi lido. Agora, precisamos aplicar as regras.` });
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
            Importar Folha de Ponto
          </CardTitle>
          <CardDescription>
            Exporte sua planilha de folha de ponto para o formato CSV. Em seguida, importe o arquivo aqui para que o sistema possa processar os dados.
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
      
      <Alert variant="default">
        <FileQuestion className="h-4 w-4" />
        <AlertTitle>Próximos Passos</AlertTitle>
        <AlertDescription>
          Agora preciso que você me explique em detalhes as regras e o formato da sua planilha. Como são as colunas? Quais são as regras para calcular as horas? Com base nas suas explicações, implementarei a lógica para processar o arquivo importado.
        </AlertDescription>
      </Alert>


      {/* A área abaixo será usada para exibir os dados processados */}
      {timeSheetData.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Dados Processados da Folha de Ponto</CardTitle>
              </CardHeader>
              <CardContent>
                  {/* Tabela ou outra forma de visualização dos dados virá aqui */}
                  <p>Os dados processados aparecerão aqui.</p>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
