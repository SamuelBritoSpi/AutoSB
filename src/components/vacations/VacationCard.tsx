"use client";

import type { Vacation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface VacationCardProps {
  vacation: Vacation;
  onDelete: (id: string) => void;
  onEdit: (vacation: Vacation) => void;
}

export default function VacationCard({ vacation, onDelete, onEdit }: VacationCardProps) {

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
              <DropdownMenuItem onClick={() => onDelete(vacation.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
        {/* Conteúdo do cartão de férias, se houver mais algum. */}
      </CardContent>
      <CardFooter>
        {/* Rodapé do cartão de férias, se necessário */}
      </CardFooter>
    </Card>
  );
}
