"use client";

import React, { useMemo, useState } from 'react';
import type { ThirdPartyEmployee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  employees: ThirdPartyEmployee[];
  onEdit: (emp: ThirdPartyEmployee) => void;
  onDelete: (id: string) => void;
  onOpenReport: () => void;
}

export default function ThirdPartyEmployeeList({ employees, onEdit, onDelete, onOpenReport }: Props) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, escola ou CPF..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={onOpenReport} className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" /> Gerar Relatório / Exportar
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Lotação</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((emp) => (
                <React.Fragment key={emp.id}>
                  <TableRow className={cn(expandedId === emp.id && "bg-muted/30 border-b-0")}>
                    <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(emp.id)}>
                            {expandedId === emp.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{emp.name}</span>
                        <span className="text-xs text-muted-foreground">CPF: {emp.cpf}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.company === 'CONFIANÇA' ? 'default' : 'secondary'}>
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
                      <Badge variant="outline" className="text-xs">{emp.status}</Badge>
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
                      <TableCell colSpan={7} className="pb-4 px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-background border shadow-inner">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase text-primary border-b pb-1 flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Detalhes Gerais
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <p><span className="text-muted-foreground">Admissão:</span> {format(parseISO(emp.admissionDate), 'dd/MM/yyyy')}</p>
                                    <p><span className="text-muted-foreground">Contato:</span> {emp.contact}</p>
                                    <p><span className="text-muted-foreground">COD.sec:</span> {emp.codSec}</p>
                                </div>
                                {emp.observation && (
                                    <div className="mt-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Observação:</p>
                                        <p className="text-xs bg-primary/5 p-2 rounded italic">"{emp.observation}"</p>
                                    </div>
                                )}
                            </div>
                            
                            {(emp.extraData && Object.keys(emp.extraData).length > 0) && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-amber-600 border-b pb-1">Colunas Extras da Planilha</h4>
                                    <div className="grid grid-cols-1 gap-1">
                                        {Object.entries(emp.extraData).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-xs p-1 border-b border-dashed">
                                                <span className="text-muted-foreground">{key}:</span>
                                                <span className="font-medium">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum funcionário terceirizado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
