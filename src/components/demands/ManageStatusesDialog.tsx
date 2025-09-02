
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { DemandStatus } from "@/lib/types";
import { Loader2, PlusCircle, Trash2, X } from 'lucide-react';

interface ManageStatusesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: DemandStatus[];
  onAddStatus: (label: string) => Promise<void>;
  onDeleteStatus: (id: string) => Promise<void>;
}

export default function ManageStatusesDialog({
  open,
  onOpenChange,
  statuses,
  onAddStatus,
  onDeleteStatus,
}: ManageStatusesDialogProps) {
  const { toast } = useToast();
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newStatusLabel.trim()) {
      toast({ variant: 'destructive', title: "Erro", description: "O nome do status não pode ser vazio." });
      return;
    }
    setIsAdding(true);
    try {
      await onAddStatus(newStatusLabel.trim());
      setNewStatusLabel("");
      toast({ title: "Status Adicionado", description: `"${newStatusLabel.trim()}" foi adicionado com sucesso.` });
    } catch (error) {
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível adicionar o status." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (status: DemandStatus) => {
    if (statuses.length <= 1) {
        toast({ variant: 'destructive', title: "Ação não permitida", description: "Deve haver pelo menos um status." });
        return;
    }
    setDeletingId(status.id);
    try {
        await onDeleteStatus(status.id);
        toast({ title: "Status Removido", description: `"${status.label}" foi removido.`});
    } catch (error) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível remover o status." });
    } finally {
        setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Status</DialogTitle>
          <DialogDescription>
            Adicione ou remova os status que sua equipe usa para acompanhar as demandas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Status Atuais</h4>
            <div className="space-y-2 rounded-md border p-2">
                {statuses.length > 0 ? statuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between">
                        <span>{status.label}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(status)} disabled={deletingId === status.id}>
                            {deletingId === status.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center">Nenhum status cadastrado.</p>
                )}
            </div>
          </div>
          <div className="space-y-2">
             <h4 className="font-medium">Adicionar Novo Status</h4>
            <div className="flex items-center space-x-2">
                <Input
                id="new-status"
                value={newStatusLabel}
                onChange={(e) => setNewStatusLabel(e.target.value)}
                placeholder="Ex: Em Aprovação"
                />
                <Button onClick={handleAdd} disabled={isAdding}>
                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4"/>}
                    Adicionar
                </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

