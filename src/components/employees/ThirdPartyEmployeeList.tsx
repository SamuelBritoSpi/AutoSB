
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { ThirdPartyEmployee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  History,
  Info, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Printer,
  Filter,
  RotateCcw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn, formatCPF } from '@/lib/utils';
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
import { renderReport } from '@/lib/print-utils';
import { THIRD_PARTY_STATUSES, normalizeThirdPartyStatus } from '@/lib/third-party-status';
import ThirdPartyReport from '../reports/ThirdPartyReport';

interface Props {
  employees: ThirdPartyEmployee[];
  onEdit: (emp: ThirdPartyEmployee) => void;
  onDelete: (id: string) => void;
}

const getSchoolKey = (employee: ThirdPartyEmployee) =>
  employee.schoolId || employee.schoolName || 'sem-escola';

export default function ThirdPartyEmployeeList({ employees, onEdit, onDelete }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const companyOptions = useMemo(() => (
    Array.from(new Set(employees.map(e => e.company).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  ), [employees]);

  const schoolOptions = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach(e => {
      const key = getSchoolKey(e);
      if (!map.has(key)) {
        map.set(key, e.schoolName || (key === 'sem-escola' ? 'Sem lotação' : key));
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [employees]);

  const statusOptions = THIRD_PARTY_STATUSES;

  const roleOptions = useMemo(() => (
    Array.from(new Set(employees.map(e => e.role || 'sem-funcao').filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  ), [employees]);

  // Filtra os funcionários com base na busca e nos filtros selecionados
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const cpfTerm = term.replace(/\D/g, '');

    return employees
      .filter(e => {
        if (companyFilter !== 'all' && e.company !== companyFilter) return false;
        if (schoolFilter !== 'all' && getSchoolKey(e) !== schoolFilter) return false;
        if (statusFilter !== 'all' && normalizeThirdPartyStatus(e.status) !== statusFilter) return false;
        if (roleFilter !== 'all' && (e.role || 'sem-funcao') !== roleFilter) return false;
        if (!term) return true;

        const name = (e.name || '').toLowerCase();
        const school = (e.schoolName || '').toLowerCase();
        const cpf = (e.cpf || '').replace(/\D/g, '');
        const role = (e.role || '').toLowerCase();
        const municipio = (e.municipio || '').toLowerCase();
        const company = (e.company || '').toLowerCase();

        return name.includes(term) || 
               school.includes(term) || 
               (cpfTerm && cpf.includes(cpfTerm)) ||
               role.includes(term) ||
               municipio.includes(term) ||
               company.includes(term);
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [employees, search, companyFilter, schoolFilter, statusFilter, roleFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    companyFilter !== 'all' ||
    schoolFilter !== 'all' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all';

  // Sempre que um filtro mudar, voltamos para a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, companyFilter, schoolFilter, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Garante que a página atual continue válida após filtrar
  useEffect(() => {
    if (currentPage > Math.max(1, totalPages)) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

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

  const handleClearFilters = () => {
    setSearch('');
    setCompanyFilter('all');
    setSchoolFilter('all');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  const handleGenerateReport = () => {
    const reportEmployees = selectedIds.length > 0
      ? employees.filter(e => selectedIds.includes(e.id))
      : filtered;

    if (reportEmployees.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum registro',
        description: 'Ajuste os filtros ou selecione funcionários para gerar o relatório.',
      });
      return;
    }

    const isManualSelection = selectedIds.length > 0;

    renderReport(
      <ThirdPartyReport
        employees={reportEmployees}
        filters={{
          company: isManualSelection ? 'all' : companyFilter,
          schoolId: isManualSelection ? 'all' : schoolFilter,
          schoolName: isManualSelection
            ? undefined
            : schoolOptions.find(o => o.value === schoolFilter)?.label,
          status: isManualSelection ? 'all' : statusFilter,
          role: isManualSelection ? 'all' : roleFilter,
          search: isManualSelection ? '' : search,
          scope: isManualSelection ? 'selected' : 'filtered',
        }}
      />,
      'Relatório de Funcionários Terceirizados'
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        onDelete(id);
      }
      toast({
        title: "Exclusão Concluída",
        description: `${selectedIds.length} funcionários removidos.`,
      });
      setSelectedIds([]);
      setIsConfirmOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: "Erro na Exclusão" });
    }
  };

  // Lógica para mostrar apenas um bloco de páginas (ex: 5 por vez)
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      if (i > 0) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Filters & Actions */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por nome, CPF, função..." 
              className="pl-10 pr-10 border-none bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                className="rounded-full px-4"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir ({selectedIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReport}
              className="rounded-full"
              title={selectedIds.length > 0
                ? 'Imprimir somente os funcionários selecionados'
                : 'Imprimir todos os funcionários filtrados'}
            >
              <Printer className="mr-2 h-3.5 w-3.5" />
              {selectedIds.length > 0 ? `Imprimir (${selectedIds.length})` : 'Gerar Relatório'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2 border-t pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </span>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-full sm:w-[170px] bg-muted/50 border-none">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companyOptions.map(company => (
                <SelectItem key={company} value={company}>{company}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="w-full sm:w-[210px] bg-muted/50 border-none">
              <SelectValue placeholder="Lotação" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              <SelectItem value="all">Todas as lotações</SelectItem>
              {schoolOptions.map(school => (
                <SelectItem key={school.value} value={school.value}>{school.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-muted/50 border-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[190px] bg-muted/50 border-none">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              <SelectItem value="all">Todas as funções</SelectItem>
              {roleOptions.map(role => (
                <SelectItem key={role} value={role}>
                  {role === 'sem-funcao' ? 'Sem função' : role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleClearFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Limpar filtros
            </Button>
          )}

          <span className="text-[11px] text-muted-foreground lg:ml-auto">
            Exibindo <strong className="text-foreground">{filtered.length}</strong> de{' '}
            <strong className="text-foreground">{employees.length}</strong> registros
            {selectedIds.length > 0 && (
              <> · <strong className="text-primary">{selectedIds.length}</strong> selecionado(s)</>
            )}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Funcionário / CPF</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Empresa / Lotação</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Função</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length > 0 ? paginatedItems.map((emp) => (
                <React.Fragment key={emp.id}>
                  <TableRow className={cn(
                    "hover:bg-muted/20 transition-colors",
                    expandedId === emp.id && "bg-muted/30 border-b-0",
                    selectedIds.includes(emp.id) && "bg-primary/5"
                  )}>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedIds.includes(emp.id)}
                        onCheckedChange={() => toggleSelect(emp.id)}
                      />
                    </TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => toggleExpand(emp.id)}>
                            {expandedId === emp.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{emp.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{formatCPF(emp.cpf)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{emp.schoolName}</span>
                            <Badge variant={emp.company === 'CONFIANÇA' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 leading-none">
                                {emp.company}
                            </Badge>
                        </div>
                        <span className="text-[9px] uppercase text-muted-foreground">{emp.municipio || 'N/A'} - {emp.nte}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{emp.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] uppercase font-bold py-0",
                          normalizeThirdPartyStatus(emp.status) === 'Ativo'
                            ? "border-green-600/40 text-green-700"
                            : "border-red-600/40 text-red-700"
                        )}
                      >
                        {normalizeThirdPartyStatus(emp.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-blue-600" onClick={() => onEdit(emp)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-destructive" onClick={() => onDelete(emp.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedId === emp.id && (
                    <TableRow className="bg-muted/30 border-t-0">
                      <TableCell colSpan={7} className="pb-4 px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-background border shadow-inner">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase text-primary/70 border-b pb-1 flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Informações do Contrato
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Admissão</p>
                                      <p className="font-medium">{emp.admissionDate ? format(parseISO(emp.admissionDate), 'dd/MM/yyyy') : '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Contato</p>
                                      <p className="font-medium">{emp.contact}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">COD.sec</p>
                                      <p className="font-medium">{emp.codSec}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[9px]">Contrato</p>
                                      <p className="font-medium">{emp.contractType || '—'}</p>
                                    </div>
                                </div>
                                
                                {emp.observation && (
                                    <div className="mt-2">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Observações:</p>
                                        <p className="text-xs bg-muted/50 p-2 rounded-lg italic text-muted-foreground">"{emp.observation}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase text-amber-600/80 border-b pb-1 flex items-center gap-2">
                                    <History className="h-3 w-3" /> Histórico Recente
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                    {emp.history && emp.history.length > 0 ? emp.history.map((h, i) => (
                                        <div key={i} className="text-[10px] p-2 rounded-lg border border-dashed bg-amber-50/30">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-amber-700">{h.field}</span>
                                                <span className="text-muted-foreground">{format(parseISO(h.date), 'dd/MM/yy HH:mm')}</span>
                                            </div>
                                            <p className="text-muted-foreground">De: <span className="line-through">{h.oldValue}</span></p>
                                            <p className="font-medium text-foreground">Para: {h.newValue}</p>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] text-muted-foreground italic py-2">Sem alterações registradas.</p>
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
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    {hasActiveFilters ? "Nenhum resultado encontrado para os filtros selecionados." : "Nenhum funcionário cadastrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Section - Minimalist */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
          <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">
             Mostrando <span className="text-foreground">{paginatedItems.length}</span> de <span className="text-foreground">{filtered.length}</span> registros
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center px-2">
              {getVisiblePages().map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 rounded-full text-xs font-bold transition-all",
                    currentPage === page ? "shadow-md scale-110" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remover Funcionários
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você selecionou <strong>{selectedIds.length}</strong> registro(s). Esta ação é permanente. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90 rounded-full">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
