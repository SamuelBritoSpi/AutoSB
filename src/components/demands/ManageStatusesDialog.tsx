
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
import { Loader2, PlusCircle, Trash2, X, Palette, Smile, icons, type LucideIcon, type LucideProps, Lock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface ManageStatusesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: DemandStatus[];
  onAddStatus: (label: string, icon: string, color: string) => void;
  onDeleteStatus: (id: string) => Promise<void>;
}

const availableIcons = [
    "Inbox", "FileClock", "Hourglass", "MailQuestion", "Send", "CheckCircle2", "XCircle", "ChevronRightCircle", "Clock", "FileCheck", "FileText", "History", "Paperclip"
];

const availableColors = [
  "bg-slate-500", "bg-gray-500", "bg-zinc-500", "bg-neutral-500",
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
  "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
  "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
  "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
  "bg-rose-500",
];

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const IconComponent = (icons as any)[name];
    return IconComponent ? <IconComponent {...props} /> : <Smile {...props}/>;
};

// Define the fixed statuses that cannot be deleted.
const fixedStatuses = ["Aberto", "Aguardando Resposta", "Finalizado"];


export default function ManageStatusesDialog({
  open,
  onOpenChange,
  statuses,
  onAddStatus,
  onDeleteStatus,
}: ManageStatusesDialogProps) {
  const { toast } = useToast();
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Inbox");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newStatusLabel.trim()) {
      toast({ variant: 'destructive', title: "Erro", description: "O nome do status não pode ser vazio." });
      return;
    }
    if (statuses.some(s => s.label.toLowerCase() === newStatusLabel.trim().toLowerCase())) {
      toast({ variant: 'destructive', title: "Erro", description: "Este status já existe." });
      return;
    }

    setIsAdding(true);
    
    // Optimistic UI update
    onAddStatus(newStatusLabel.trim(), selectedIcon, selectedColor);

    // Reset form for next entry
    setNewStatusLabel("");
    setSelectedIcon("Inbox");
    setSelectedColor("bg-blue-500");
    setIsAdding(false);
  };

  const handleDelete = async (status: DemandStatus) => {
    if (fixedStatuses.includes(status.label)) {
      toast({ variant: 'destructive', title: "Ação não permitida", description: "Este é um status fixo e não pode ser excluído." });
      return;
    }
    setDeletingId(status.id);
    try {
        await onDeleteStatus(status.id);
        toast({ title: "Status Removido", description: `"${status.label}" foi removido.`});
    } catch (error) {
        // The error toast is handled in the parent component
    } finally {
        setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Status</DialogTitle>
          <DialogDescription>
            Adicione ou remova os status que sua equipe usa para acompanhar as demandas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Status Atuais</h4>
            <ScrollArea className="h-40 rounded-md border p-2">
                {statuses.length > 0 ? statuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-2">
                            <LucideIcon name={status.icon} className={cn("h-4 w-4", status.color ? status.color.replace("bg-", "text-") : "")} />
                            <span>{status.label}</span>
                             {fixedStatuses.includes(status.label) && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(status)} disabled={deletingId === status.id || fixedStatuses.includes(status.label)}>
                            {deletingId === status.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum status cadastrado.</p>
                )}
            </ScrollArea>
          </div>
          <div className="space-y-2 border-t pt-4">
             <h4 className="font-medium">Adicionar Novo Status</h4>
            <div className="space-y-2">
                <Label htmlFor="new-status-label">Nome do Status</Label>
                <Input
                    id="new-status-label"
                    value={newStatusLabel}
                    onChange={(e) => setNewStatusLabel(e.target.value)}
                    placeholder="Ex: Em Aprovação"
                    disabled={isAdding}
                />
            </div>
             <div className="flex items-center space-x-2">
                <div className='w-1/2'>
                    <Label>Ícone</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className='w-full justify-start'>
                                <LucideIcon name={selectedIcon} className="mr-2 h-4 w-4" />
                                {selectedIcon}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[200px]">
                            <ScrollArea className="h-48">
                                {availableIcons.map(iconName => (
                                    <Button key={iconName} variant="ghost" className="w-full justify-start" onClick={() => setSelectedIcon(iconName)}>
                                         <LucideIcon name={iconName} className="mr-2 h-4 w-4" />
                                         {iconName}
                                    </Button>
                                ))}
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className='w-1/2'>
                    <Label>Cor</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className='w-full justify-start'>
                                <Palette className="mr-2 h-4 w-4" />
                                <div className={cn("w-4 h-4 rounded-full", selectedColor)}></div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-[200px]">
                             <div className="grid grid-cols-5 gap-2">
                                {availableColors.map(colorClass => (
                                    <Button key={colorClass} variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedColor(colorClass)}>
                                        <div className={cn("w-4 h-4 rounded-full", colorClass)}></div>
                                    </Button>
                                ))}
                             </div>
                        </PopoverContent>
                    </Popover>
                </div>
             </div>
             <div className="pt-2">
                <Button onClick={handleAdd} disabled={isAdding || !newStatusLabel.trim()} className='w-full'>
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
