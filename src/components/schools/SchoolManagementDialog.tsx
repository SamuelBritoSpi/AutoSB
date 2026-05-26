
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
import { Trash2, Loader2, Building, Search, School as SchoolIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import type { School } from '@/lib/types';
import { Badge } from '../ui/badge';

interface SchoolManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schools: School[];
  onDeleteSchool: (id: string) => Promise<void>;
}

export default function SchoolManagementDialog({
  open,
  onOpenChange,
  schools,
  onDeleteSchool,
}: SchoolManagementDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSchools = schools
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este colégio? Isso removerá a opção da lista de seleção tanto em Cartões quanto em Fardamento. (Registros já salvos não serão afetados)")) {
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
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between gap-4 pr-8">
            <DialogTitle className="flex items-center gap-2 truncate">
                <Building className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">Gerenciar Colégios</span>
            </DialogTitle>
            <Badge variant="secondary" className="font-mono whitespace-nowrap shrink-0">
                {schools.length} total
            </Badge>
          </div>
          <DialogDescription>
            Lista única compartilhada entre Cartões e Fardamento.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 py-4 flex flex-col min-h-0 space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colégio..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 rounded-md border p-2 bg-muted/10">
            {filteredSchools.length > 0 ? (
              <div className="space-y-1">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent group gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <SchoolIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{school.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(school.id)}
                      disabled={deletingId === school.id}
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground px-4">
                  {searchTerm ? "Nenhum colégio encontrado para esta busca." : "Nenhum colégio cadastrado."}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
