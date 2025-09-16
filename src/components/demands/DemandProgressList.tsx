
"use client";

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { History, MoreVertical, Pencil, Save, Trash2, X, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { DemandProgress } from '@/lib/types';
import { getDemandProgressByDemandId, updateDemandProgress, deleteDemandProgress } from '@/lib/idb';

interface DemandProgressListProps {
  demandId: string;
  newProgress?: DemandProgress;
}

export default function DemandProgressList({ demandId, newProgress }: DemandProgressListProps) {
  const [progressList, setProgressList] = useState<DemandProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const handleEdit = (progress: DemandProgress) => {
    setEditingId(progress.id);
    setEditingText(progress.description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const originalProgress = progressList.find(p => p.id === editingId);
    if (!originalProgress || originalProgress.description === editingText) {
      handleCancelEdit();
      return;
    }
    
    setIsSubmitting(true);
    const updatedProgress = { ...originalProgress, description: editingText };

    try {
        await updateDemandProgress(updatedProgress);
        setProgressList(prev => prev.map(p => (p.id === editingId ? updatedProgress : p)));
        toast({ title: "Andamento atualizado", description: "O registro foi salvo com sucesso." });
        handleCancelEdit();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a alteração.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro de andamento?")) return;

    const originalList = [...progressList];
    setProgressList(prev => prev.filter(p => p.id !== id));

    try {
      await deleteDemandProgress(id);
      toast({ title: "Andamento excluído" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o registro.' });
      setProgressList(originalList);
    }
  };


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
            {progressList.map((progress) => (
              <div key={progress.id} className="relative pl-6 border-l-2 border-border group">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary" />
                
                <div className="ml-4 space-y-1 pb-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(progress.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                     {editingId !== progress.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(progress)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(progress.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>
                  {editingId === progress.id ? (
                    <div className="space-y-2 pt-1">
                        <Textarea 
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="text-sm"
                            rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                <X className="mr-2 h-4 w-4" /> Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar
                            </Button>
                        </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{progress.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
