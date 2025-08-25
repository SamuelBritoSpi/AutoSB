"use client";

import type { Employee, MedicalCertificate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, FileText, Edit, Trash2, Menu, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { analyzeCertificates } from '@/lib/certificate-logic';

interface EmployeeCardProps {
  employee: Employee;
  certificates: MedicalCertificate[];
  onDelete: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onManageCertificates: (employee: Employee) => void;
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

export default function EmployeeCard({ employee, certificates, onDelete, onEdit, onManageCertificates }: EmployeeCardProps) {
  const analysis = useMemo(() => analyzeCertificates(certificates, employee.contractType), [certificates, employee.contractType]);

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
              <Button variant="ghost" size="icon" className="p-1 h-auto w-auto">
                <Menu className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" /> Editar Funcionário
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(employee.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Funcionário
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
      <CardContent className="flex-grow space-y-2">
        <div className="text-sm">
            <p className='font-semibold'>Resumo dos Atestados (60 dias):</p>
            <p className="text-muted-foreground">
                Dias Acumulados: <span className="font-bold">{analysis.totalDaysInWindow}</span>
            </p>
             <p className={`font-bold ${analysis.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {analysis.status}
            </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onManageCertificates(employee)} className='w-full'>
            <Activity className="mr-2 h-4 w-4" /> Gerenciar Atestados
        </Button>
      </CardFooter>
    </Card>
  );
}
