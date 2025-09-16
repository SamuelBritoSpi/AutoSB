"use client";

import type { JustifiedAbsence, Employee } from '@/lib/types';
import EmployeeAbsenceCard from './EmployeeAbsenceCard';
import { CalendarDays, FileText, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import JustifiedAbsenceForm from './JustifiedAbsenceForm';
import AbsenceHistoryDialog from './AbsenceHistoryDialog';
import AbsenceDetailsDialog from './AbsenceDetailsDialog';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';

interface JustifiedAbsenceListProps {
  absences: JustifiedAbsence[];
  employees: Employee[];
  onDeleteAbsence: (id: string) => void;
  onUpdateAbsence: (absence: JustifiedAbsence) => void;
  onAddAbsence: (absence: Omit<JustifiedAbsence, 'id'>) => void;
}

export default function JustifiedAbsenceList({ absences, employees, onDeleteAbsence, onUpdateAbsence, onAddAbsence }: JustifiedAbsenceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAbsence, setEditingAbsence] = useState<JustifiedAbsence | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAbsenceDetails, setSelectedAbsenceDetails] = useState<JustifiedAbsence | null>(null);
  
  const handleEdit = (absence: JustifiedAbsence) => {
    setEditingAbsence(absence);
    setIsEditDialogOpen(true);
  };

  const handleOpenHistory = (employee: Employee) => {
    setHistoryEmployee(employee);
  };

  const handleViewDetails = (absence: JustifiedAbsence) => {
    console.log('Opening details for absence:', absence);
    setSelectedAbsenceDetails(absence);
  };
  
  const handleUpdateAndClose = (absence: JustifiedAbsence) => {
    onUpdateAbsence(absence);
    closeEditDialog();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAbsence(null);
  };

  const employeesWithAbsences = useMemo(() => {
    const absencesByEmployee = absences.reduce((acc, absence) => {
      acc[absence.employeeId] = acc[absence.employeeId] || [];
      acc[absence.employeeId].push(absence);
      return acc;
    }, {} as Record<string, JustifiedAbsence[]>);

    return employees
      .map(employee => ({
        ...employee,
        absences: (absencesByEmployee[employee.id] || []).sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ),
      }))
      .filter(employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [employees, absences, searchTerm]);

  return (
    <div className="space-y-6">
      <Card className="shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h2 id="absences-list-title" className="text-2xl font-headline font-semibold text-primary">
                Faltas Justificadas por Funcionário
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative w-full flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por funcionário..." 
                  className="pl-10 w-full" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Falta
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {employeesWithAbsences.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum registro de falta justificada encontrado para a busca.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeesWithAbsences.map((employee) => (
            <EmployeeAbsenceCard 
              key={employee.id} 
              employee={employee}
              absences={employee.absences}
              onOpenHistory={() => handleOpenHistory(employee)}
              onViewDetails={(absence) => {
                console.log('Card clicked, absence:', absence);
                handleViewDetails(absence);
              }}
            />
          ))}
        </div>
      )}

      {/* Diálogo de Adição */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Falta Justificada</DialogTitle>
            <DialogDescription>
              Registre uma nova falta justificada para um funcionário.
            </DialogDescription>
          </DialogHeader>
          <JustifiedAbsenceForm
            onAddAbsence={(absence) => {
              onAddAbsence(absence);
              setIsAddDialogOpen(false);
            }}
            onClose={() => setIsAddDialogOpen(false)}
            employees={employees}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição */}
      {editingAbsence && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Falta Justificada</DialogTitle>
            </DialogHeader>
            <JustifiedAbsenceForm
              existingAbsence={editingAbsence}
              onUpdateAbsence={handleUpdateAndClose}
              onClose={closeEditDialog}
              employees={employees}
              onAddAbsence={()=>{}} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de Histórico */}
      <Dialog open={!!historyEmployee} onOpenChange={(isOpen) => !isOpen && setHistoryEmployee(null)}>
         <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
               <DialogTitle>Histórico de Faltas de {historyEmployee?.name}</DialogTitle>
               <DialogDescription>
                  Gerencie todos os períodos de falta justificada registrados.
               </DialogDescription>
            </DialogHeader>
            {historyEmployee && (
              <AbsenceHistoryDialog
                absences={absences.filter(a => a.employeeId === historyEmployee.id)}
                onUpdate={onUpdateAbsence}
                onDelete={onDeleteAbsence}
                onEdit={handleEdit}
              />
            )}
         </DialogContent>
      </Dialog>

      {/* Diálogo de Detalhes da Falta */}
      {selectedAbsenceDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AbsenceDetailsDialog
                absence={selectedAbsenceDetails}
                onUpdate={onUpdateAbsence}
                onClose={() => setSelectedAbsenceDetails(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
