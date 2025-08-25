"use client";

import type { Employee } from '@/lib/types';
import EmployeeCard from './EmployeeCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeeForm from './EmployeeForm';

interface EmployeeListProps {
  employees: Employee[];
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
}

export default function EmployeeList({ employees, onDeleteEmployee, onUpdateEmployee }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = useMemo(() => {
    return employees
      .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-10 w-full sm:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum funcionário encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDelete={onDeleteEmployee}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {editingEmployee && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
            </DialogHeader>
            <EmployeeForm
              existingEmployee={editingEmployee}
              onUpdateEmployee={onUpdateEmployee}
              onClose={closeEditDialog}
              onAddEmployee={() => {}}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
