
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
import { Trash2, Loader2, Building, Search, School as SchoolIcon, Plus, AlertCircle } from 'lucide-react';
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
            description: `O colégio "${duplicate.name}" já existe e é similar ao que você digitou.`,
        });
        return;
    }

    setIsAdding(true);
    try {
      await onAddSchool(formattedName);
      setNewSchoolName("");
      toast({ title: "Sucesso", description: "Colégio adicionado à lista global." });
    } catch (error) {
      // Erro tratado no pai
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este colégio? Isso removerá a opção da lista de seleção global.")) {
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
      <DialogContent className="sm:max-w-xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between gap-4 pr-8">
            <DialogTitle className="flex items-center gap-2 truncate text-xl">
                <Building className="h-6 w-6 text-primary shrink-0" />
                <span className="truncate">Gerenciar Colégios</span>
            </DialogTitle>
            <Badge variant="secondary" className="font-mono whitespace-nowrap shrink-0">
                {schools.length} total
            </Badge>
          </div>
          <DialogDescription>
            Controle a lista de colégios compartilhada pelo sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 py-4 flex flex-col min-h-0 space-y-4">
          {/* Sessão de Adicionar Novo */}
          <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
            <label className="text-xs font-bold uppercase text-muted-foreground">Cadastrar Novo Colégio</label>
            <div className="flex gap-2">
                <Input
                  placeholder="Nome do colégio..."
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="bg-background"
                />
                <Button onClick={handleAdd} disabled={isAdding || !newSchoolName.trim()} size="icon">
                   {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                </Button>
            </div>
          </div>

          <Separator />

          {/* Busca */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colégio na lista..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista com Scroll */}
          <div className="flex-1 min-h-0 border rounded-md bg-muted/10 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
                {filteredSchools.length > 0 ? (
                <div className="p-2 space-y-1">
                    {filteredSchools.map((school) => (
                    <div
                        key={school.id}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-background border border-transparent hover:border-border group gap-3 transition-all"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <SchoolIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium truncate">{school.name}</span>
                        </div>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
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
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Building className="h-10 w-10 text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground px-4">
                    {searchTerm ? "Nenhum colégio encontrado para esta busca." : "Nenhum colégio cadastrado."}
                    </p>
                </div>
                )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-muted/20 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar Gerenciamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
