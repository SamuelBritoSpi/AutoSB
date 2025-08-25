"use client";

import type { Employee, MedicalCertificate } from '@/lib/types';
import EmployeeCard from './EmployeeCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmployeeForm from './EmployeeForm';
import MedicalCertificateList from './MedicalCertificateList';
import { Button } from '../ui/button';

interface EmployeeListProps {
  employees: Employee[];
  certificates: MedicalCertificate[];
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onAddCertificate: (certificate: MedicalCertificate) => void;
  onDeleteCertificate: (id: string) => void;
}

export default function EmployeeList({ 
  employees, 
  certificates,
  onDeleteEmployee, 
  onUpdateEmployee,
  onAddCertificate,
  onDeleteCertificate
}: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [managingCertificatesFor, setManagingCertificatesFor] = useState<Employee | null>(null);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const closeEditDialog = () => {
    setEditingEmployee(null);
  };
  
  const handleManageCertificates = (employee: Employee) => {
    setManagingCertificatesFor(employee);
  };

  const closeCertificateManager = () => {
    setManagingCertificatesFor(null);
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
              certificates={certificates.filter(c => c.employeeId === employee.id)}
              onDelete={onDeleteEmployee}
              onEdit={handleEdit}
              onManageCertificates={handleManageCertificates}
            />
          ))}
        </div>
      )}

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={(isOpen) => !isOpen && closeEditDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              existingEmployee={editingEmployee}
              onUpdateEmployee={onUpdateEmployee}
              onClose={closeEditDialog}
              onAddEmployee={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Manage Certificates Dialog */}
      <Dialog open={!!managingCertificatesFor} onOpenChange={(isOpen) => !isOpen && closeCertificateManager()}>
          <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                  <DialogTitle>Gerenciar Atestados de {managingCertificatesFor?.name}</DialogTitle>
              </DialogHeader>
              {managingCertificatesFor && (
                  <MedicalCertificateList
                      employee={managingCertificatesFor}
                      certificates={certificates.filter(c => c.employeeId === managingCertificatesFor.id)}
                      onAddCertificate={onAddCertificate}
                      onDeleteCertificate={onDeleteCertificate}
                  />
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
