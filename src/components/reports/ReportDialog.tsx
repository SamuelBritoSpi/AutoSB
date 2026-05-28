
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Demand, Vacation, Employee, DemandStatus, MedicalCertificate, DemandProgress, ThirdPartyEmployee, School } from '@/lib/types';
import { renderReport } from '@/lib/print-utils';
import DemandsReport from './DemandsReport';
import VacationsReport from './VacationsReport';
import CertificatesReport from './CertificatesReport';
import ThirdPartyReport from './ThirdPartyReport';
import { getAllDemandProgress } from '@/lib/idb';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: 'demands' | 'vacations' | 'certificates' | 'third-party';
  demands?: Demand[];
  demandStatuses?: DemandStatus[];
  vacations?: Vacation[];
  employees?: Employee[];
  certificates?: MedicalCertificate[];
  thirdPartyEmployees?: ThirdPartyEmployee[];
  schools?: School[];
}

export default function ReportDialog({
  open,
  onOpenChange,
  reportType,
  demands = [],
  demandStatuses = [],
  vacations = [],
  employees = [],
  certificates = [],
  thirdPartyEmployees = [],
  schools = []
}: ReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedDemandId, setSelectedDemandId] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    let title = "Relatório";

    const filterByDate = (items: any[], field: string) => {
        if (!dateRange.from && !dateRange.to) return items;
        return items.filter(item => {
            const itemDate = new Date(item[field]);
            const from = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
            const to = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;
            if (from && to) return itemDate >= from && itemDate <= to;
            if (from) return itemDate >= from;
            if (to) return itemDate <= to;
            return true;
        });
    };

    if (reportType === 'demands') {
        title = "Relatório de Demandas";
        let filtered = filterByDate(demands, 'dueDate');
        if (selectedDemandId !== 'all') filtered = filtered.filter(d => d.id === selectedDemandId);
        if (statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
        
        const demandProgress = await getAllDemandProgress();
        renderReport(<DemandsReport demands={filtered} employees={employees} demandStatuses={demandStatuses} demandProgress={demandProgress} filters={{dateRange, employeeId: 'all', status: statusFilter}} />, title);
    }

    if (reportType === 'vacations') {
        title = "Relatório de Afastamentos";
        let filtered = filterByDate(vacations, 'startDate');
        if (employeeFilter !== 'all') filtered = filtered.filter(v => v.employeeId === employeeFilter);
        renderReport(<VacationsReport vacations={filtered} filters={{dateRange, employeeId: employeeFilter}} />, title);
    }
    
    if (reportType === 'certificates') {
        title = "Relatório de Atestados Médicos";
        let filtered = filterByDate(certificates, 'certificateDate');
        if (employeeFilter !== 'all') filtered = filtered.filter(c => c.employeeId === employeeFilter);
        renderReport(<CertificatesReport certificates={filtered} employees={employees} filters={{dateRange, employeeId: employeeFilter}} />, title);
    }

    if (reportType === 'third-party') {
        title = "Base de Dados Terceirizados";
        let filtered = [...thirdPartyEmployees];
        if (companyFilter !== 'all') filtered = filtered.filter(e => e.company === companyFilter);
        if (schoolFilter !== 'all') filtered = filtered.filter(e => e.schoolId === schoolFilter);
        renderReport(<ThirdPartyReport employees={filtered} filters={{company: companyFilter, schoolId: schoolFilter}} />, title);
    }

    setIsGenerating(false);
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (reportType) {
        case 'demands': return 'Gerar Relatório de Demandas';
        case 'vacations': return 'Gerar Relatório de Afastamentos';
        case 'certificates': return 'Gerar Relatório de Atestados';
        case 'third-party': return 'Exportar Base Terceirizados';
        default: return 'Gerar Relatório';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Selecione os filtros abaixo para gerar seu relatório personalizado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            {reportType !== 'third-party' && (
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date-range" className="text-right">Período</Label>
                  <div className="col-span-3">
                      <Popover>
                          <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange.from && !dateRange.to && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (dateRange.to ? <>{format(dateRange.from, "P", {locale: ptBR})} - {format(dateRange.to, "P", {locale: ptBR})}</> : format(dateRange.from, "P", {locale: ptBR})) : <span>Selecione o período</span>}
                          </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to }} onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })} numberOfMonths={2} locale={ptBR} />
                          </PopoverContent>
                      </Popover>
                  </div>
              </div>
            )}

            {reportType === 'third-party' && (
                <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Empresa</Label>
                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Todas as empresas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as empresas</SelectItem>
                                <SelectItem value="CONFIANÇA">CONFIANÇA</SelectItem>
                                <SelectItem value="CSH">CSH</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Escola</Label>
                        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Todas as escolas" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                <SelectItem value="all">Todas as escolas</SelectItem>
                                {schools.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {reportType === 'demands' && (
                <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Demanda</Label>
                        <Select value={selectedDemandId} onValueChange={setSelectedDemandId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Todas as demandas" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                <SelectItem value="all">Todas as demandas</SelectItem>
                                {demands.sort((a, b) => a.title.localeCompare(b.title)).map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                {demandStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
