
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, Building, Search, School as SchoolIcon, Plus, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import type { School } from '@/lib/types';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface SchoolManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schools: School[];
  onDeleteSchool: (id: string) => Promise<void>;
  onAddSchool: (name: string) => Promise<School>;
}

/**
 * Converte uma string para Title Case
 */
function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Gera uma chave de comparação simplificada para evitar duplicatas
 */
function getComparisonKey(name: string) {
    const noiseWords = [
        'colegio', 'escola', 'estadual', 'municipal', 'tempo', 'integral', 
        'ceti', 'de', 'da', 'do', 'das', 'dos', 'e', 'centro', 'educacional'
    ];
    
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter(word => !noiseWords.includes(word) && word.length > 1)
        .join('');
}

export default function SchoolManagementDialog({
  open,
  onOpenChange,
  schools,
  onDeleteSchool,
  onAddSchool,
}: SchoolManagementDialogProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredSchools = schools
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = async () => {
    const trimmedName = newSchoolName.trim();
    if (!trimmedName) return;
    
    const formattedName = toTitleCase(trimmedName);
    const newKey = getComparisonKey(formattedName);
    
    const duplicate = schools.find(s => getComparisonKey(s.name) === newKey);
    
    if (duplicate) {
        toast({
            variant: 'destructive',
            title: "Colégio já cadastrado",
            description: `O colégio "${duplicate.name}" já existe ou é muito similar.`,
        });
        return;
    }

    setIsAdding(true);
    try {
      await onAddSchool(formattedName);
      setNewSchoolName("");
      toast({ title: "Sucesso", description: "Colégio adicionado à lista." });
    } catch (error) {
      // Erro já tratado no pai via toast
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este colégio?")) {
      return;
    }
    
    setDeletingId(id);
    try {
      await onDeleteSchool(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl truncate">
                <Building className="h-5 w-5 text-primary shrink-0" />
                <span>Gerenciar Colégios</span>
            </DialogTitle>
            <Badge variant="secondary" className="shrink-0">
                {schools.length}
            </Badge>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Adicione ou remova colégios da lista global.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-4 sm:px-6 py-2 flex flex-col min-h-0 space-y-4">
          {/* Sessão de Adicionar Novo */}
          <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <label className="text-[10px] font-bold uppercase text-primary/70">Cadastrar Novo</label>
            <div className="flex gap-2">
                <Input
                  placeholder="Nome do colégio..."
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="bg-background h-9 text-sm"
                />
                <Button onClick={handleAdd} disabled={isAdding || !newSchoolName.trim()} size="sm" className="shrink-0 h-9">
                   {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
          </div>

          <Separator />

          {/* Busca */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na lista..."
              className="pl-8 h-9 text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm("")}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
          </div>

          {/* Lista com Scroll */}
          <div className="flex-1 min-h-0 border rounded-md bg-muted/5 overflow-hidden">
            <ScrollArea className="h-full">
                {filteredSchools.length > 0 ? (
                <div className="p-2 space-y-1.5">
                    {filteredSchools.map((school) => (
                    <div
                        key={school.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/60 hover:border-primary/20 transition-colors gap-3"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <SchoolIcon className="h-4 w-4 text-primary/60 shrink-0" />
                            <span className="text-sm font-medium truncate leading-tight block w-full">
                              {school.name}
                            </span>
                        </div>
                        <div className="flex shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all"
                              onClick={() => handleDelete(school.id)}
                              disabled={deletingId === school.id}
                              title="Excluir colégio"
                            >
                            {deletingId === school.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            </Button>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                    <p className="text-xs text-muted-foreground">
                    {searchTerm ? "Nenhum resultado." : "Nenhum colégio cadastrado."}
                    </p>
                </div>
                )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-9 text-sm">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
