
"use client";

import { useMemo } from 'react';
import type { Demand, Employee, MedicalCertificate, DemandStatus, Vacation, AbsenceType, AbsenceStatus } from '@/lib/types';
import StatCard from './StatCard';
import PriorityChart from './PriorityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CalendarClock, CheckCircle2, ListTodo, Mailbox, Hourglass, CalendarOff, Plane, Gift, Stethoscope, Baby, Clock, CalendarCheck, CalendarX } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { analyzeCertificates } from '@/lib/certificate-logic';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


interface DashboardTabProps {
  demands: Demand[];
  employees: Employee[];
  certificates: MedicalCertificate[];
  demandStatuses: DemandStatus[];
  vacations: Vacation[];
}

const FINAL_STATUS_LABEL = 'Finalizado';
const WAITING_STATUS_LABEL = 'Aguardando Resposta';

const absenceTypeDetails: Record<AbsenceType, { label: string, icon: React.ReactNode }> = {
    ferias: { label: 'Férias', icon: <Plane className="h-4 w-4" /> },
    licenca_premio: { label: 'Licença Prêmio', icon: <Gift className="h-4 w-4" /> },
    licenca_medica: { label: 'Licença Médica', icon: <Stethoscope className="h-4 w-4" /> },
    licenca_maternidade: { label: 'Licença Maternidade', icon: <Baby className="h-4 w-4" /> },
};

const absenceStatusDetails: Record<AbsenceStatus, { label: string, icon: React.ReactNode, className: string }> = {
    planejado: { label: 'Planejado', icon: <Clock className="h-3 w-3" />, className: 'text-blue-600' },
    confirmado: { label: 'Usufruído', icon: <CalendarCheck className="h-3 w-3" />, className: 'text-green-600' },
    cancelado: { label: 'Não Usufruído', icon: <CalendarX className="h-3 w-3" />, className: 'text-red-600' },
};


export default function DashboardTab({ demands, employees, certificates, demandStatuses, vacations }: DashboardTabProps) {
  
  const demandStats = useMemo(() => {
    const done = demands.filter(d => d.status === FINAL_STATUS_LABEL).length;
    const waiting = demands.filter(d => d.status === WAITING_STATUS_LABEL).length;
    const openDemands = demands.length - done;
    return { openDemands, waiting, done };
  }, [demands]);

  const upcomingDemands = useMemo(() => {
    return demands
      .filter(d => d.status !== FINAL_STATUS_LABEL && parseISO(d.dueDate) >= new Date())
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 5);
  }, [demands]);

  const highRiskEmployees = useMemo(() => {
    return employees
      .map(employee => {
        const employeeCerts = certificates.filter(c => c.employeeId === employee.id);
        const analysis = analyzeCertificates(employeeCerts, employee.contractType);
        return {
          ...employee,
          ...analysis
        };
      })
      .filter(e => e.status !== 'Normal')
      .sort((a,b) => b.totalDaysInWindow - a.totalDaysInWindow);
  }, [employees, certificates]);

  const currentMonthAbsences = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    return vacations.filter(v => {
      const vacationStart = parseISO(v.startDate);
      const vacationEnd = parseISO(v.endDate);
      
      // Verifica se o intervalo do afastamento sobrepõe o mês atual.
      return isWithinInterval(vacationStart, { start, end }) ||
             isWithinInterval(vacationEnd, { start, end }) ||
             (vacationStart < start && vacationEnd > end);

    }).sort((a,b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [vacations]);


  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Demandas em Aberto" value={demandStats.openDemands} icon={<Hourglass className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Aguardando Resposta" value={demandStats.waiting} icon={<Mailbox className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Finalizadas" value={demandStats.done} icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Gráfico de Prioridades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demandas por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityChart demands={demands} demandStatuses={demandStatuses} />
          </CardContent>
        </Card>

        {/* Próximas Entregas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="h-5 w-5 mr-2" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDemands.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Demanda</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingDemands.map(demand => (
                    <TableRow key={demand.id}>
                        <TableCell className="font-medium">{demand.title}</TableCell>
                        <TableCell>{demand.priority}</TableCell>
                        <TableCell>{format(parseISO(demand.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma demanda com prazo futuro.</p>
            )}
          </CardContent>
        </Card>
      </div>

       {/* Alertas de Atestados */}
       {highRiskEmployees.length > 0 && (
         <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alerta de Atestados
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Os seguintes funcionários atingiram ou ultrapassaram o limite de dias de atestado nos últimos 60 dias.
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Dias Acumulados</TableHead>
                            <TableHead>Limite</TableHead>
                            <TableHead>Ação Recomendada</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {highRiskEmployees.map(emp => (
                            <TableRow key={emp.id} className="bg-destructive/10">
                                <TableCell className="font-medium">{emp.name}</TableCell>
                                <TableCell>{emp.totalDaysInWindow}</TableCell>
                                <TableCell>{emp.limit}</TableCell>
                                <TableCell className="font-bold">{emp.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
       )}

      {/* Afastamentos do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarOff className="h-5 w-5 mr-2" />
            Afastamentos em {format(new Date(), 'MMMM', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
           {currentMonthAbsences.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Período</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentMonthAbsences.map(v => {
                       const typeDetails = absenceTypeDetails[v.type] || { label: v.type, icon: null };
                       const statusDetails = absenceStatusDetails[v.status] || { label: v.status, icon: null, className: '' };
                       return (
                        <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.employeeName}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                    {typeDetails.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={cn('flex items-center gap-1.5 text-sm font-medium', statusDetails.className, v.status === 'cancelado' && 'line-through')}>
                                    {statusDetails.icon}
                                    {statusDetails.label}
                                </span>
                            </TableCell>
                            <TableCell>{format(parseISO(v.startDate), 'dd/MM')} - {format(parseISO(v.endDate), 'dd/MM')}</TableCell>
                        </TableRow>
                       );
                    })}
                </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground py-4">Nenhum afastamento agendado para o mês atual.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

