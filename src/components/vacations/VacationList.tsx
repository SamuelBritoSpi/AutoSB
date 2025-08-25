"use client";

import type { Vacation, Demand } from '@/lib/types';
import VacationCard from './VacationCard';
import { CalendarDays, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VacationForm from './VacationForm';

interface VacationListProps {
  vacations: Vacation[];
  demands: Demand[]; 
  onDeleteVacation: (id: string) => void;
  onUpdateVacation: (vacation: Vacation) => void;
}

export default function VacationList({ vacations, onDeleteVacation, onUpdateVacation }: VacationListProps) {
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

  const filteredVacations = useMemo(() => {
    return vacations
      .filter(v => v.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [vacations, searchTerm]);

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
    </div>
  );
}
