"use client";

import type { Demand, DemandStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, ArrowDownCircle, CalendarDays, CheckCircle2, ChevronDown, Circle, Edit, PlayCircle, Trash2, Mailbox, Search, Send, UserCheck, Hourglass, Building } from 'lucide-react';

interface DemandCardProps {
  demand: Demand;
  onUpdateStatus: (id: string, status: DemandStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (demand: Demand) => void;
}

const priorityIcons: Record<Demand['priority'], React.ReactElement> = {
  alta: <AlertTriangle className="h-5 w-5 text-destructive mr-1" />,
  media: <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-warning))] mr-1" />,
  baixa: <ArrowDownCircle className="h-5 w-5 text-[hsl(var(--status-success))] mr-1" />,
};

const priorityText: Record<Demand['priority'], string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const statusInfo: Record<DemandStatus, { text: string; icon: React.ReactElement }> = {
  'recebido': { text: 'Recebido', icon: <Mailbox className="h-5 w-5 text-muted-foreground mr-2" /> },
  'em-analise': { text: 'Em Análise', icon: <Search className="h-5 w-5 text-blue-500 mr-2" /> },
  'aguardando-sec': { text: 'Aguardando SEC', icon: <Hourglass className="h-5 w-5 text-amber-600 mr-2" /> },
  'aguardando-csh': { text: 'Aguardando CSH', icon: <Hourglass className="h-5 w-5 text-amber-600 mr-2" /> },
  'aguardando-confianca': { text: 'Aguardando Confiança', icon: <Hourglass className="h-5 w-5 text-amber-600 mr-2" /> },
  'aguardando-gestor': { text: 'Aguardando Gestor', icon: <Hourglass className="h-5 w-5 text-amber-600 mr-2" /> },
  'resposta-recebida': { text: 'Resposta Recebida', icon: <UserCheck className="h-5 w-5 text-purple-600 mr-2" /> },
  'finalizado': { text: 'Finalizado', icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-success))] mr-2" /> },
};


export default function DemandCard({ demand, onUpdateStatus, onDelete, onEdit }: DemandCardProps) {
  const allStatuses: DemandStatus[] = [
    'recebido',
    'em-analise',
    'aguardando-sec',
    'aguardando-csh',
    'aguardando-confianca',
    'aguardando-gestor',
    'resposta-recebida',
    'finalizado'
  ];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1">{demand.title.substring(0,50)}{demand.title.length > 50 ? '...' : ''}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(demand)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(demand.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          <div className="flex items-center">
            {priorityIcons[demand.priority]}
            <span>Prioridade: {priorityText[demand.priority]}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-foreground text-base">{demand.description}</p>
        <Separator />
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>Entrega: {format(parseISO(demand.dueDate), "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>
        <div className="flex items-center text-sm">
          {statusInfo[demand.status].icon}
          <span>Status: {statusInfo[demand.status].text}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Mudar Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allStatuses.map((status) => (
              <DropdownMenuItem key={status} onClick={() => onUpdateStatus(demand.id, status)} disabled={demand.status === status}>
                {statusInfo[status].icon} {statusInfo[status].text}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
