
"use client";

import type { Vacation, Demand, Employee } from '@/lib/types';
import EmployeeVacationCard from './EmployeeVacationCard';
import { CalendarDays, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VacationForm from './VacationForm';

interface VacationListProps {
  vacations: Vacation[];
  employees: Employee[];
  onDeleteVacation: (id: string) => void;
  onUpdateVacation: (vacation: Vacation) => void;
}

export default function VacationList({ vacations, employees, onDeleteVacation, onUpdateVacation }: VacationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleEdit = (vacation: Vacation) => {
    setEditingVacation(vacation);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingVacation(null);
  };

  const employeesWithVacations = useMemo(() => {
    const vacationsByEmployee = vacations.reduce((acc, vacation) => {
      acc[vacation.employeeId] = acc[vacation.employeeId] || [];
      acc[vacation.employeeId].push(vacation);
      return acc;
    }, {} as Record<string, Vacation[]>);

    return employees
      .map(employee => ({
        ...employee,
        vacations: (vacationsByEmployee[employee.id] || []).sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ),
      }))
      .filter(employee => 
        employee.vacations.length > 0 &&
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [employees, vacations, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Férias Agendadas por Funcionário</h3>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por funcionário..." 
            className="pl-10 w-full sm:w-[250px]" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {employeesWithVacations.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum registro de férias encontrado para a busca.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeesWithVacations.map((employee) => (
            <EmployeeVacationCard 
              key={employee.id} 
              employee={employee}
              vacations={employee.vacations}
              onDelete={onDeleteVacation}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {editingVacation && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Período de Férias</DialogTitle>
            </DialogHeader>
            <VacationForm
              existingVacation={editingVacation}
              onUpdateVacation={onUpdateVacation}
              onClose={closeEditDialog}
              employees={employees}
              onAddVacation={()=>{}} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
