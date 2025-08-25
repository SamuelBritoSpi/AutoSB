"use client";

import type { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, FileText, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onEdit: (employee: Employee) => void;
}

const contractTypeMap: Record<Employee['contractType'], string> = {
  efetivo: 'Efetivo',
  reda: 'REDA',
  terceirizado: 'Terceirizado',
};

const contractTypeVariant: Record<Employee['contractType'], "default" | "secondary" | "outline"> = {
    efetivo: 'default',
    reda: 'secondary',
    terceirizado: 'outline'
};

export default function EmployeeCard({ employee, onDelete, onEdit }: EmployeeCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            {employee.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(employee.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
            <Badge variant={contractTypeVariant[employee.contractType]}>
                {contractTypeMap[employee.contractType]}
            </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Futuro espaço para resumo de atestados */}
        <div className="text-sm text-muted-foreground italic">
            <p>Atestados serão gerenciados aqui.</p>
        </div>
      </CardContent>
    </Card>
  );
}
