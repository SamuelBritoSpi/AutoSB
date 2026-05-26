
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
import { Trash2, Loader2, Building, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import type { School } from '@/lib/types';

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
    if (!window.confirm("Tem certeza que deseja excluir este colégio? Isso não afetará registros de cartões ou fardamentos já salvos, mas removerá a opção da lista de seleção.")) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Gerenciar Colégios
          </DialogTitle>
          <DialogDescription>
            Visualize ou exclua os colégios cadastrados no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colégio..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-2">
            {filteredSchools.length > 0 ? (
              <div className="space-y-1">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
                  >
                    <span className="text-sm font-medium truncate pr-4">{school.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Nenhum colégio encontrado para esta busca." : "Nenhum colégio cadastrado."}
                </p>
              </div>
            )}
          </ScrollArea>
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
