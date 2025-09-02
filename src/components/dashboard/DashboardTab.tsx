
"use client";

import { useMemo } from 'react';
import type { Demand, Employee, MedicalCertificate } from '@/lib/types';
import StatCard from './StatCard';
import PriorityChart from './PriorityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CalendarClock, CheckCircle2, ListTodo, Mailbox, Hourglass } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { analyzeCertificates } from '@/lib/certificate-logic';
import { useAuth } from '../AuthProvider';

interface DashboardTabProps {
  demands: Demand[];
  employees: Employee[];
  certificates: MedicalCertificate[];
}

export default function DashboardTab({ demands, employees, certificates }: DashboardTabProps) {
  const { demandStatuses } = useAuth();
  
  const lastStatus = useMemo(() => demandStatuses.slice(-1)[0]?.label, [demandStatuses]);

  const demandStats = useMemo(() => {
    const finalizadoStatus = lastStatus || 'finalizado';
    const newDemands = demands.filter(d => d.status !== finalizadoStatus).length;
    const waiting = demands.filter(d => d.status.toLowerCase().includes('aguardando')).length;
    const done = demands.filter(d => d.status === finalizadoStatus).length;
    return { newDemands, waiting, done };
  }, [demands, lastStatus]);

  const upcomingDemands = useMemo(() => {
    const finalizadoStatus = lastStatus || 'finalizado';
    return demands
      .filter(d => d.status !== finalizadoStatus && parseISO(d.dueDate) >= new Date())
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 5);
  }, [demands, lastStatus]);

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

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Demandas em Aberto" value={demandStats.newDemands} icon={<Hourglass className="h-5 w-5 text-muted-foreground" />} />
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
            <PriorityChart demands={demands} />
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
    </div>
  );
}
