
"use client";

import React, { useState } from 'react';
import type { ThirdPartyEmployee, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as ShadCnCard, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2, PlusCircle, Building2 } from 'lucide-react';
import ThirdPartyEmployeeForm from './ThirdPartyEmployeeForm';
import ThirdPartyEmployeeList from './ThirdPartyEmployeeList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  employees: ThirdPartyEmployee[];
  schools: School[];
  onAddEmployee: (emp: Omit<ThirdPartyEmployee, 'id'>) => void;
  onUpdateEmployee: (emp: ThirdPartyEmployee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddSchool: (name: string) => Promise<School>;
  onOpenSchoolManagement: () => void;
}

export default function ThirdPartyEmployeePage({
  employees,
  schools,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddSchool,
  onOpenSchoolManagement,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<ThirdPartyEmployee | null>(null);

  return (
    <div className="space-y-6">
      <ShadCnCard className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
              <UserCircle2 className="h-6 w-6" />
              Gestão de Funcionários Terceirizados
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={onOpenSchoolManagement}>
                <Building2 className="mr-2 h-4 w-4" /> Colégios
              </Button>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Ocultar' : 'Novo Funcionário'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </ShadCnCard>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ThirdPartyEmployeeForm
            schools={schools}
            onAddSchool={onAddSchool}
            onAddEmployee={(data) => {
              onAddEmployee(data);
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <ThirdPartyEmployeeList
        employees={employees}
        onEdit={setEditingEmp}
        onDelete={onDeleteEmployee}
      />

      <Dialog open={!!editingEmp} onOpenChange={(open) => !open && setEditingEmp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Funcionário Terceirizado</DialogTitle>
          </DialogHeader>
          {editingEmp && (
            <ThirdPartyEmployeeForm
              existingEmployee={editingEmp}
              schools={schools}
              onAddSchool={onAddSchool}
              onUpdateEmployee={(data) => {
                onUpdateEmployee(data);
                setEditingEmp(null);
              }}
              onAddEmployee={() => {}}
              onClose={() => setEditingEmp(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
