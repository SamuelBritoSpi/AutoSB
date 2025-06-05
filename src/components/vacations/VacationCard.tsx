"use client";

import type { Vacation, Demand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, AlertOctagon, Edit, Trash2, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface VacationCardProps {
  vacation: Vacation;
  onDelete: (id: string) => void;
  onEdit: (vacation: Vacation) => void;
  onCheckConflict: (vacation: Vacation) => void;
}

export default function VacationCard({ vacation, onDelete, onEdit, onCheckConflict }: VacationCardProps) {
  const conflictResult = vacation.conflictCheckResult;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" /> {vacation.employeeName}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(vacation)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(vacation.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm text-muted-foreground flex items-center">
          <CalendarRange className="h-4 w-4 mr-2" />
          {format(parseISO(vacation.startDate), "dd/MM/yyyy", { locale: ptBR })} - {format(parseISO(vacation.endDate), "dd/MM/yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflictResult && (
          <>
            <Separator className="my-3" />
            <div className={`p-3 rounded-md ${conflictResult.conflictDetected ? 'bg-destructive/10 border-destructive/50 border' : 'bg-green-500/10 border-green-500/50 border'}`}>
              <div className="flex items-center mb-1">
                <AlertOctagon className={`h-5 w-5 mr-2 ${conflictResult.conflictDetected ? 'text-destructive' : 'text-green-600'}`} />
                <p className={`font-semibold ${conflictResult.conflictDetected ? 'text-destructive' : 'text-green-700'}`}>
                  {conflictResult.conflictDetected ? "Conflito Detectado" : "Sem Conflitos Detectados"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{conflictResult.conflictDetails}</p>
              {conflictResult.checkedDemandDescription && (
                <p className="text-xs text-muted-foreground mt-1">
                  Verificado contra: {conflictResult.checkedDemandDescription.substring(0,50)}{conflictResult.checkedDemandDescription.length > 50 ? "..." : ""}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onCheckConflict(vacation)}>
          <BrainCircuit className="h-4 w-4 mr-2" />
          Verificar Conflito
        </Button>
      </CardFooter>
    </Card>
  );
}
