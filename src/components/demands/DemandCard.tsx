
"use client";

import type { Demand, DemandStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, ArrowDownCircle, CalendarDays, CheckCircle2, ChevronDown, Edit, Trash2, Settings } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DemandCardProps {
  demand: Demand;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (demand: Demand) => void;
  statuses: DemandStatus[];
  onManageStatuses: () => void;
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

export default function DemandCard({ demand, onUpdateStatus, onDelete, onEdit, statuses, onManageStatuses }: DemandCardProps) {
  
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
            <Badge variant="secondary">{demand.status}</Badge>
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
            {statuses.map((status) => (
              <DropdownMenuItem key={status.id} onClick={() => onUpdateStatus(demand.id, status.label)} disabled={demand.status === status.label}>
                {status.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onManageStatuses}>
                <Settings className="mr-2 h-4 w-4" /> Gerenciar Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
