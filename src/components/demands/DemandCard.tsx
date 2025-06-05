"use client";

import type { Demand, DemandStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, ArrowDownCircle, CalendarDays, CheckCircle2, ChevronDown, Circle, Edit, PlayCircle, Trash2 } from 'lucide-react';

interface DemandCardProps {
  demand: Demand;
  onUpdateStatus: (id: string, status: DemandStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (demand: Demand) => void;
}

const priorityIcons: Record<Demand['priority'], React.ReactElement> = {
  alta: <AlertTriangle className="h-5 w-5 text-red-500 mr-1" />,
  media: <AlertTriangle className="h-5 w-5 text-yellow-500 mr-1" />,
  baixa: <ArrowDownCircle className="h-5 w-5 text-green-500 mr-1" />,
};

const priorityText: Record<Demand['priority'], string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const statusIcons: Record<DemandStatus, React.ReactElement> = {
  'a-fazer': <Circle className="h-5 w-5 text-gray-500 mr-2" />,
  'em-progresso': <PlayCircle className="h-5 w-5 text-blue-500 mr-2" />,
  'concluida': <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />,
};

const statusText: Record<DemandStatus, string> = {
  'a-fazer': "A Fazer",
  'em-progresso': "Em Progresso",
  'concluida': "Concluída",
};


export default function DemandCard({ demand, onUpdateStatus, onDelete, onEdit }: DemandCardProps) {
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
              <DropdownMenuItem onClick={() => onDelete(demand.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
          {statusIcons[demand.status]}
          <span>Status: {statusText[demand.status]}</span>
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
            {(['a-fazer', 'em-progresso', 'concluida'] as DemandStatus[]).map((status) => (
              <DropdownMenuItem key={status} onClick={() => onUpdateStatus(demand.id, status)} disabled={demand.status === status}>
                {statusIcons[status]} {statusText[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
