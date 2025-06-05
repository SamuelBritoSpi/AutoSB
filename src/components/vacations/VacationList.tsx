"use client";

import type { Vacation, Demand } from '@/lib/types';
import VacationCard from './VacationCard';
import { CalendarDays, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import VacationForm from './VacationForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';


interface VacationListProps {
  vacations: Vacation[];
  demands: Demand[]; 
  onDeleteVacation: (id: string) => void;
  onUpdateVacation: (vacation: Vacation) => void;
  onCheckConflict: (vacation: Vacation, demandId: string) => Promise<void>;
}

export default function VacationList({ vacations, demands, onDeleteVacation, onUpdateVacation, onCheckConflict }: VacationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [conflictCheckVacation, setConflictCheckVacation] = useState<Vacation | null>(null);
  const [isConflictCheckDialogOpen, setIsConflictCheckDialogOpen] = useState(false);
  const [selectedDemandIdForConflict, setSelectedDemandIdForConflict] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const handleEdit = (vacation: Vacation) => {
    setEditingVacation(vacation);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingVacation(null);
  };
  
  const openConflictCheckDialog = (vacation: Vacation) => {
    setConflictCheckVacation(vacation);
    setSelectedDemandIdForConflict(null); 
    setIsConflictCheckDialogOpen(true);
  };

  const handleRunConflictCheck = async () => {
    if (conflictCheckVacation && selectedDemandIdForConflict) {
      setIsCheckingConflict(true);
      await onCheckConflict(conflictCheckVacation, selectedDemandIdForConflict);
      setIsCheckingConflict(false);
      setIsConflictCheckDialogOpen(false); 
    }
  };

  const filteredVacations = useMemo(() => {
    return vacations
      .filter(v => v.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [vacations, searchTerm]);

  // Sort demands by due date for the select dropdown
  const sortedDemands = useMemo(() => {
    return [...demands].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [demands]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Férias Registradas</h3>
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

      {filteredVacations.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum registro de férias encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacations.map((vacation) => (
            <VacationCard 
              key={vacation.id} 
              vacation={vacation} 
              onDelete={onDeleteVacation}
              onEdit={handleEdit}
              onCheckConflict={openConflictCheckDialog}
            />
          ))}
        </div>
      )}

      {editingVacation && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Registro de Férias</DialogTitle>
            </DialogHeader>
            <VacationForm
              existingVacation={editingVacation}
              onUpdateVacation={onUpdateVacation}
              onClose={closeEditDialog}
              onAddVacation={()=>{}} 
            />
          </DialogContent>
        </Dialog>
      )}

      {isConflictCheckDialogOpen && conflictCheckVacation && (
        <Dialog open={isConflictCheckDialogOpen} onOpenChange={setIsConflictCheckDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verificar Conflito de Férias</DialogTitle>
              <DialogDescription>
                Selecione uma demanda para verificar se as férias de <strong>{conflictCheckVacation.employeeName}</strong> ({format(parseISO(conflictCheckVacation.startDate), "dd/MM/yy")} - {format(parseISO(conflictCheckVacation.endDate), "dd/MM/yy")}) entram em conflito.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label htmlFor="demandSelect" className="block text-sm font-medium text-foreground mb-1">
                  Selecionar Demanda:
                </label>
                <Select onValueChange={setSelectedDemandIdForConflict} value={selectedDemandIdForConflict || ""}>
                    <SelectTrigger id="demandSelect" className="w-full">
                        <SelectValue placeholder="Escolha uma demanda" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedDemands.length > 0 ? sortedDemands.map(demand => (
                            <SelectItem key={demand.id} value={demand.id}>
                                {demand.title.substring(0,35)}{demand.title.length > 35 ? '...' : ''} (Entrega: {format(parseISO(demand.dueDate), "dd/MM/yy")})
                            </SelectItem>
                        )) : <SelectItem value="no-demands" disabled>Nenhuma demanda disponível</SelectItem>}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConflictCheckDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleRunConflictCheck} disabled={!selectedDemandIdForConflict || isCheckingConflict || demands.length === 0}>
                {isCheckingConflict ? "Verificando..." : "Verificar Conflito"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
