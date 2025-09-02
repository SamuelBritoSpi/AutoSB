
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
import type { Demand, DemandStatus } from "@/lib/types";
import { Loader2, PlusCircle, Trash2, X, Palette, Smile, icons, type LucideIcon, type LucideProps, Lock, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';


interface ManageStatusesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demandStatuses: DemandStatus[];
  demands: Demand[];
  onAddStatus: (label: string, icon: string, color: string) => void;
  onDeleteStatus: (id: string) => void;
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
    { label: "Cinza", value: "text-gray-500" },
    { label: "Vermelho", value: "text-red-500" },
    { label: "Laranja", value: "text-orange-500" },
    { label: "Amarelo", value: "text-yellow-500" },
    { label: "Verde", value: "text-green-500" },
    { label: "Azul", value: "text-blue-500" },
    { label: "Roxo", value: "text-purple-500" },
    { label: "Rosa", value: "text-pink-500" },
]

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
}: ManageStatusesDialogProps) {
  const { toast } = useToast();
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Inbox");
  const [selectedColor, setSelectedColor] = useState(availableColors[0].value);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);

  const handleAdd = () => {
    if (!newStatusLabel.trim()) {
      toast({ variant: 'destructive', title: "Erro", description: "O nome do status não pode ser vazio." });
      return;
    }
    if (demandStatuses.some(s => s.label.toLowerCase() === newStatusLabel.trim().toLowerCase())) {
      toast({ variant: 'destructive', title: "Erro", description: "Este status já existe." });
      return;
    }

    setIsAdding(true);
    try {
      onAddStatus(newStatusLabel.trim(), selectedIcon, selectedColor);
      setNewStatusLabel("");
      setSelectedIcon("Inbox");
      setSelectedColor(availableColors[0].value);
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
                {demandStatuses.length > 0 ? demandStatuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-2 rounded-md px-2.5 py-0.5 text-xs font-semibold">
                            <LucideIcon name={status.icon} className={cn("h-4 w-4", status.color)} />
                            <span className="text-foreground/80">{status.label}</span>
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
          <div className="space-y-4 border-t pt-4">
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
             <div className="space-y-2">
                <Label>Ícone</Label>
                <Popover open={iconPopoverOpen} onOpenChange={setIconPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={iconPopoverOpen} className='w-full justify-between'>
                            <LucideIcon name={selectedIcon} className="mr-2 h-4 w-4" />
                            {selectedIcon}
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
                          key={color.value}
                          variant="outline"
                          size="icon"
                          className={cn("w-8 h-8 rounded-full", {
                            'ring-2 ring-primary ring-offset-2': selectedColor === color.value
                          })}
                          onClick={() => setSelectedColor(color.value)}
                        >
                            <div className={cn("w-5 h-5 rounded-full", color.value.replace('text-', 'bg-'))} />
                        </Button>
                    ))}
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
