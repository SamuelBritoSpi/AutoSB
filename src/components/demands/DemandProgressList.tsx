"use client";

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { History } from 'lucide-react';
import type { DemandProgress } from '@/lib/types';
import { getDemandProgressByDemandId } from '@/lib/idb';

interface DemandProgressListProps {
  demandId: string;
  newProgress?: DemandProgress;
}

export default function DemandProgressList({ demandId, newProgress }: DemandProgressListProps) {
  const [progressList, setProgressList] = useState<DemandProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgressList = async () => {
      try {
        setIsLoading(true);
        const progress = await getDemandProgressByDemandId(demandId);
        setProgressList(progress);
      } catch (error) {
        console.error("Erro ao buscar histórico de andamento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressList();
  }, [demandId]);

  useEffect(() => {
    if (newProgress && !progressList.some(p => p.id === newProgress.id)) {
      setProgressList(prev => [newProgress, ...prev]);
    }
  }, [newProgress, progressList]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico de Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2" />
          Histórico de Andamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {progressList.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhum andamento registrado.</p>
        ) : (
          <div className="space-y-4">
            {progressList.map((progress, index) => (
              <div key={progress.id} className="relative pl-6">
                {/* Linha vertical conectando os itens */}
                {index < progressList.length - 1 && (
                  <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Círculo indicador */}
                <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {format(parseISO(progress.date), "PPPp", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {progress.description}
                  </p>
                </div>
                
                {index < progressList.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}