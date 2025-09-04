
"use client";

import { useState, useEffect } from 'react';
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
import type { Demand, DemandStatus } from "@/lib/types";
import { Loader2, PlusCircle, Trash2, X, Palette, Smile, icons, type LucideIcon, type LucideProps, Lock, Check, ChevronsUpDown, Pencil, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


interface ManageStatusesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demandStatuses: DemandStatus[];
  demands: Demand[];
  onAddStatus: (label: string, icon: string, color: string) => void;
  onDeleteStatus: (id: string) => void;
  onUpdateStatus: (status: DemandStatus) => void;
}

const availableIcons = [
    "Inbox", "FileClock", "Hourglass", "MailQuestion", "Send", "CheckCircle2", "XCircle", "ChevronRightCircle", 
    "Clock", "FileCheck", "FileText", "History", "Paperclip", "AlarmClock", "Archive", "ArrowRight", "BadgeInfo", 
    "Bell", "Book", "Briefcase", "Bug", "Building", "Calendar", "ClipboardCheck", "Copy", "Database", "File", 
    "Filter", "Flag", "Folder", "Globe", "Heart", "Home", "Image", "Key", "Lightbulb", "Link", "Lock", "Mail", 
    "MapPin", "MessageCircle", "Monitor", "Package", "Pen", "Phone", "Rocket", "Save", "Search", "Settings", 
    "Shield", "ShoppingBag", "Smartphone", "Star", "Tag", "Target", "ThumbsUp", "Tool", "Trash", "TrendingUp", 
    "Unlock", "User", "Video", "Zap", "FileQuestion", "FileSearch", "FileDiff", "FileJson"
];

const availableColors = [
    { label: "Cinza", textColor: "text-gray-500", bgColor: "bg-gray-500" },
    { label: "Vermelho", textColor: "text-red-500", bgColor: "bg-red-500" },
    { label: "Laranja", textColor: "text-orange-500", bgColor: "bg-orange-500" },
    { label: "Amarelo", textColor: "text-yellow-500", bgColor: "bg-yellow-500" },
    { label: "Verde", textColor: "text-green-500", bgColor: "bg-green-500" },
    { label: "Azul", textColor: "text-blue-500", bgColor: "bg-blue-500" },
    { label: "Roxo", textColor: "text-purple-500", bgColor: "bg-purple-500" },
    { label: "Rosa", textColor: "text-pink-500", bgColor: "bg-pink-500" },
];

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const IconComponent = (icons as any)[name];
    if (!IconComponent) {
        return <Smile {...props} />;
    }
    return <IconComponent {...props} />;
};

// Define the fixed statuses that cannot be deleted.
const fixedStatuses = ["Aberto", "Aguardando Resposta", "Finalizado"];


export default function ManageStatusesDialog({
  open,
  onOpenChange,
  demandStatuses,
  demands,
  onAddStatus,
  onDeleteStatus,
  onUpdateStatus,
}: ManageStatusesDialogProps) {
  const { toast } = useToast();
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Inbox");
  const [selectedColor, setSelectedColor] = useState(availableColors[0].textColor);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  
  const [editingStatus, setEditingStatus] = useState<DemandStatus | null>(null);

  useEffect(() => {
    // Reset form when dialog is opened/closed or editing state changes
    if (!open || !editingStatus) {
      setEditingStatus(null);
      setNewStatusLabel("");
      setSelectedIcon("Inbox");
      setSelectedColor(availableColors[0].textColor);
    } else {
      // Pre-fill form if editing
      setNewStatusLabel(editingStatus.label);
      setSelectedIcon(editingStatus.icon);
      setSelectedColor(editingStatus.color);
    }
  }, [open, editingStatus]);


  const handleSave = () => {
    if (!newStatusLabel.trim()) {
      toast({ variant: 'destructive', title: "Erro", description: "O nome do status não pode ser vazio." });
      return;
    }
    
    setIsAdding(true);
    try {
      if (editingStatus) {
        // Update existing status
        onUpdateStatus({
          ...editingStatus,
          label: newStatusLabel.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        // Add new status
        if (demandStatuses.some(s => s.label.toLowerCase() === newStatusLabel.trim().toLowerCase())) {
          toast({ variant: 'destructive', title: "Erro", description: "Este status já existe." });
          return;
        }
        onAddStatus(newStatusLabel.trim(), selectedIcon, selectedColor);
      }
      setEditingStatus(null); // Reset editing state
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (status: DemandStatus) => {
    if (fixedStatuses.includes(status.label)) {
      toast({ variant: 'destructive', title: "Ação não permitida", description: "Este é um status fixo e não pode ser excluído." });
      return;
    }
    setDeletingId(status.id);
    try {
        await onDeleteStatus(status.id);
    } finally {
        setDeletingId(null);
    }
  };

  const isFixed = editingStatus ? fixedStatuses.includes(editingStatus.label) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Status</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova os status para acompanhar as demandas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Status Atuais</h4>
            <ScrollArea className="h-40 rounded-md border p-2">
                {demandStatuses.length > 0 ? demandStatuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-1 group">
                        <div className={cn(
                            "flex items-center gap-2 rounded-md px-2.5 py-0.5 text-xs font-semibold",
                            editingStatus?.id === status.id && 'bg-accent'
                          )}>
                            <LucideIcon name={status.icon} className={cn("h-4 w-4", status.color)} />
                            <span className="text-foreground/80">{status.label}</span>
                             {fixedStatuses.includes(status.label) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Lock className="h-3 w-3 text-muted-foreground ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Status fixo</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             )}
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingStatus(status)}>
                                <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(status)} disabled={deletingId === status.id || fixedStatuses.includes(status.label)}>
                                {deletingId === status.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum status cadastrado.</p>
                )}
            </ScrollArea>
          </div>
          <div className="space-y-4 border-t pt-4">
             <h4 className="font-medium">{editingStatus ? 'Editar Status' : 'Adicionar Novo Status'}</h4>
            <div className="space-y-2">
                <Label htmlFor="new-status-label">Nome do Status</Label>
                <Input
                    id="new-status-label"
                    value={newStatusLabel}
                    onChange={(e) => setNewStatusLabel(e.target.value)}
                    placeholder="Ex: Em Aprovação"
                    disabled={isAdding || isFixed}
                />
                 {isFixed && <p className="text-xs text-muted-foreground">O nome de um status fixo não pode ser alterado.</p>}
            </div>
             <div className="space-y-2">
                <Label>Ícone</Label>
                <Popover open={iconPopoverOpen} onOpenChange={setIconPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={iconPopoverOpen} className='w-full justify-between'>
                            <div className="flex items-center gap-2">
                                <LucideIcon name={selectedIcon} className={cn("h-4 w-4", selectedColor)} />
                                {selectedIcon}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]">
                        <Command>
                            <CommandInput placeholder="Procurar ícone..." />
                            <CommandEmpty>Nenhum ícone encontrado.</CommandEmpty>
                            <CommandGroup>
                                <ScrollArea className='h-48'>
                                    {availableIcons.map(iconName => (
                                        <CommandItem
                                            key={iconName}
                                            value={iconName}
                                            onSelect={(currentValue) => {
                                                setSelectedIcon(currentValue === selectedIcon ? "" : currentValue)
                                                setIconPopoverOpen(false)
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", selectedIcon === iconName ? "opacity-100" : "opacity-0")} />
                                            <LucideIcon name={iconName} className="mr-2 h-4 w-4" />
                                            {iconName}
                                        </CommandItem>
                                    ))}
                                </ScrollArea>
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
             </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                        <Button 
                          key={color.textColor}
                          variant="outline"
                          size="icon"
                          className={cn("w-8 h-8 rounded-full", {
                            'ring-2 ring-primary ring-offset-2': selectedColor === color.textColor
                          })}
                          onClick={() => setSelectedColor(color.textColor)}
                        >
                            <div className={cn("w-5 h-5 rounded-full", color.bgColor)} />
                        </Button>
                    ))}
                </div>
              </div>

             <div className="pt-2 flex gap-2">
                <Button onClick={handleSave} disabled={isAdding || !newStatusLabel.trim()} className='w-full'>
                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingStatus ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4"/>)}
                    {editingStatus ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
                {editingStatus && (
                    <Button variant="ghost" onClick={() => setEditingStatus(null)}>
                        Cancelar Edição
                    </Button>
                )}
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
