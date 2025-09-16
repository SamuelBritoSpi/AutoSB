
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
import type { Demand, Vacation, Employee, DemandStatus, MedicalCertificate } from '@/lib/types';
import { renderReport } from '@/lib/print-utils';
import DemandsReport from './DemandsReport';
import VacationsReport from './VacationsReport';
import CertificatesReport from './CertificatesReport';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: 'demands' | 'vacations' | 'certificates';
  demands?: Demand[];
  demandStatuses?: DemandStatus[];
  vacations?: Vacation[];
  employees?: Employee[];
  certificates?: MedicalCertificate[];
}

export default function ReportDialog({
  open,
  onOpenChange,
  reportType,
  demands = [],
  demandStatuses = [],
  vacations = [],
  employees = [],
  certificates = []
}: ReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedDemandId, setSelectedDemandId] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all'); // Mantido para outros tipos de relatório
  const [statusFilter, setStatusFilter] = useState('all');

  const handleGenerateReport = () => {
    setIsGenerating(true);

    let filteredDemands = demands;
    let filteredVacations = vacations;
    let filteredCertificates = certificates;
    let title = "Relatório";

    const filterByDate = (items: {dueDate: string}[] | {startDate: string}[] | {certificateDate: string}[]) => {
        if (!dateRange.from && !dateRange.to) return items;
        return items.filter(item => {
            const itemDate = new Date(
              'dueDate' in item ? item.dueDate : 'startDate' in item ? item.startDate : item.certificateDate
            );
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
        filteredDemands = filterByDate(demands) as Demand[];
        if (selectedDemandId !== 'all') {
            filteredDemands = filteredDemands.filter(d => d.id === selectedDemandId);
        }
        if (statusFilter !== 'all') {
            filteredDemands = filteredDemands.filter(d => d.status === statusFilter);
        }
        const reportElement = <DemandsReport demands={filteredDemands} employees={employees} demandStatuses={demandStatuses} filters={{dateRange, employeeId: 'all', status: statusFilter}} />;
        renderReport(reportElement, title);
    }

    if (reportType === 'vacations') {
        title = "Relatório de Afastamentos";
        filteredVacations = filterByDate(vacations) as Vacation[];
        if (employeeFilter !== 'all') {
            filteredVacations = filteredVacations.filter(v => v.employeeId === employeeFilter);
        }
        const reportElement = <VacationsReport vacations={filteredVacations} filters={{dateRange, employeeId: employeeFilter}} />;
        renderReport(reportElement, title);
    }
    
    if (reportType === 'certificates') {
        title = "Relatório de Atestados Médicos";
        filteredCertificates = filterByDate(certificates) as MedicalCertificate[];
        if (employeeFilter !== 'all') {
            filteredCertificates = filteredCertificates.filter(c => c.employeeId === employeeFilter);
        }
        const reportElement = <CertificatesReport certificates={filteredCertificates} employees={employees} filters={{dateRange, employeeId: employeeFilter}} />;
        renderReport(reportElement, title);
    }

    setIsGenerating(false);
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (reportType) {
        case 'demands': return 'Gerar Relatório de Demandas';
        case 'vacations': return 'Gerar Relatório de Afastamentos';
        case 'certificates': return 'Gerar Relatório de Atestados';
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date-range" className="text-right">
                    Período
                </Label>
                <div className="col-span-3">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date-range"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && !dateRange.to && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y", {locale: ptBR})} - {format(dateRange.to, "LLL dd, y", {locale: ptBR})}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y", {locale: ptBR})
                                )
                            ) : (
                                <span>Selecione o período</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={dateRange}
                            onSelect={setDateRange as any}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {reportType === 'demands' && (
                <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="demand-filter" className="text-right">
                            Demanda
                        </Label>
                        <div className="col-span-3">
                            <Select value={selectedDemandId} onValueChange={setSelectedDemandId}>
                                <SelectTrigger id="demand-filter">
                                    <SelectValue placeholder="Selecione uma demanda..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] overflow-auto">
                                    <SelectItem value="all">Todas as demandas</SelectItem>
                                    {demands
                                        ?.filter(d => {
                                            // Filtrar demandas ativas por padrão
                                            return statusFilter === 'all' || 
                                                (statusFilter !== 'all' && d.status === statusFilter);
                                        })
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map(demand => (
                                            <SelectItem key={demand.id} value={demand.id}>
                                                {demand.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status-filter" className="text-right">
                            Status
                        </Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="status-filter" className="col-span-3">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-auto">
                                <SelectItem value="all">Todos os status</SelectItem>
                                {demandStatuses?.map(status => (
                                    <SelectItem key={status.id} value={status.label}>{status.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
            {reportType !== 'demands' && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee-filter" className="text-right">
                        Funcionário
                    </Label>
                    <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                        <SelectTrigger id="employee-filter" className="col-span-3">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-auto">
                            <SelectItem value="all">Todos os funcionários</SelectItem>
                            {employees?.sort((a,b) => a.name.localeCompare(b.name)).map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
