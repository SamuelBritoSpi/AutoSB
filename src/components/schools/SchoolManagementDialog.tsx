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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, Building, Search, School as SchoolIcon, Plus, X, CheckSquare, Square } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } finally {
      setIsAdding(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSchools.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSchools.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => onDeleteSchool(id)));
      setSelectedIds([]);
      toast({ title: "Exclusão Concluída", description: "Os colégios selecionados foram removidos." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Erro na exclusão", description: "Alguns colégios não puderam ser excluídos." });
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
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
              Adicione, selecione e remova colégios da lista global.
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

            {/* Busca e Seleção em Massa */}
            <div className="space-y-3">
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

              <div className="flex items-center justify-between gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSelectAll}
                  className="text-xs h-8 px-2"
                >
                  {selectedIds.length === filteredSchools.length && filteredSchools.length > 0 ? (
                    <><Square className="h-3.5 w-3.5 mr-1.5" /> Desmarcar Todos</>
                  ) : (
                    <><CheckSquare className="h-3.5 w-3.5 mr-1.5" /> Selecionar Todos</>
                  )}
                </Button>

                {selectedIds.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs h-8 animate-in fade-in slide-in-from-right-2"
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Excluir ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Lista com Scroll */}
            <div className="flex-1 min-h-0 border rounded-md bg-muted/5 overflow-hidden">
              <ScrollArea className="h-full">
                  {filteredSchools.length > 0 ? (
                  <div className="p-2 space-y-1">
                      {filteredSchools.map((school) => (
                      <div
                          key={school.id}
                          className={`flex items-center p-2.5 rounded-lg border transition-colors gap-3 cursor-pointer ${
                            selectedIds.includes(school.id) 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-background border-border/60 hover:border-primary/20'
                          }`}
                          onClick={() => toggleSelect(school.id)}
                      >
                          <Checkbox 
                            checked={selectedIds.includes(school.id)}
                            onCheckedChange={() => toggleSelect(school.id)}
                            className="shrink-0"
                          />
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <SchoolIcon className="h-4 w-4 text-primary/60 shrink-0" />
                              <span className="text-sm font-medium truncate leading-tight block w-full">
                                {school.name}
                              </span>
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

      {/* Alerta de Confirmação */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja excluir mesmo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>{selectedIds.length} colégio(s)</strong> da lista. 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}