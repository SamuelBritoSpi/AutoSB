
"use client";

import React, { useMemo, useState } from 'react';
import type { ThirdPartyEmployee, School } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, FileSpreadsheet, Building2, UserCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  employees: ThirdPartyEmployee[];
  onEdit: (emp: ThirdPartyEmployee) => void;
  onDelete: (id: string) => void;
}

export default function ThirdPartyEmployeeList({ employees, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      e.cpf.includes(search)
    );
  }, [employees, search]);

  const handleExportSim = () => {
    alert("Funcionalidade de integração com OneDrive está sendo configurada. Por enquanto, use os relatórios visuais.");
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
        <Button variant="outline" onClick={handleExportSim} className="w-full sm:w-auto">
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Sincronizar com OneDrive
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={emp.id}>
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
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
