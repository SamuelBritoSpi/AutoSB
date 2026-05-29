
"use client";

import React, { useMemo, useState } from 'react';
import type { ThirdPartyEmployee, ThirdPartyHistoryEntry } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  History,
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';

interface Props {
  employees: ThirdPartyEmployee[];
  onEdit: (emp: ThirdPartyEmployee) => void;
  onDelete: (id: string) => void;
  onOpenReport: () => void;
}

export default function ThirdPartyEmployeeList({ employees, onEdit, onDelete, onOpenReport }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filtered = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      e.cpf.includes(search)
    );
  }, [employees, search]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(e => e.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        onDelete(id);
      }
      toast({
        title: "Exclusão Concluída",
        description: `${selectedIds.length} funcionários foram removidos.`,
      });
      setSelectedIds([]);
      setIsConfirmOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro na Exclusão",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, escola ou CPF..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmOpen(true)}
              className="animate-in fade-in slide-in-from-right-2"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedIds.length})
            </Button>
          )}
          <Button variant="secondary" onClick={onOpenReport} className="w-full md:w-auto">
            <FileText className="mr-2 h-4 w-4" /> Relatório / Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead>Funcionário / CPF</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Lotação Atual</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((emp) => (
                <React.Fragment key={emp.id}>
                  <TableRow className={cn(
                    expandedId === emp.id && "bg-muted/30 border-b-0",
                    selectedIds.includes(emp.id) && "bg-primary/5"
                  )}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(emp.id)}
                        onCheckedChange={() => toggleSelect(emp.id)}
                      />
                    </TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(emp.id)}>
                            {expandedId === emp.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{emp.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">CPF: {emp.cpf}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.company === 'CONFIANÇA' ? 'default' : 'secondary'} className="text-[10px]">
                        {emp.company}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{emp.schoolName}</span>
                        <span className="text-[10px] uppercase text-muted-foreground">{emp.municipio} - {emp.nte}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">{emp.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(emp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedId === emp.id && (
                    <TableRow className="bg-muted/30 border-t-0">
                      <TableCell colSpan={8} className="pb-4 px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-background border shadow-inner">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase text-primary border-b pb-1 flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Detalhes Gerais
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Admissão</p>
                                      <p>{format(parseISO(emp.admissionDate), 'dd/MM/yyyy')}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Contato Atual</p>
                                      <p>{emp.contact}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">COD.sec</p>
                                      <p>{emp.codSec}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Contrato</p>
                                      <p>{emp.contractType || '—'}</p>
                                    </div>
                                </div>
                                {emp.observation && (
                                    <div className="mt-2">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Observação:</p>
                                        <p className="text-xs bg-primary/5 p-2 rounded italic">"{emp.observation}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase text-amber-600 border-b pb-1 flex items-center gap-2">
                                    <History className="h-3 w-3" /> Histórico de Alterações
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {emp.history && emp.history.length > 0 ? emp.history.map((h, i) => (
                                        <div key={i} className="text-[10px] p-2 rounded border border-dashed bg-amber-50/50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-amber-700">{h.field}</span>
                                                <span className="text-muted-foreground">{format(parseISO(h.date), 'dd/MM/yy HH:mm')}</span>
                                            </div>
                                            <p><span className="text-muted-foreground">De:</span> <span className="line-through">{h.oldValue}</span></p>
                                            <p><span className="text-muted-foreground">Para:</span> <span className="font-medium">{h.newValue}</span></p>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] text-muted-foreground italic py-2">Sem alterações registradas no sistema.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão em Massa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>{selectedIds.length}</strong> funcionário(s). 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Sim, Excluir Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
