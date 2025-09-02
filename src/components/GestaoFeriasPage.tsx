
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DemandForm from '@/components/demands/DemandForm';
import DemandList from '@/components/demands/DemandList';
import VacationForm from '@/components/vacations/VacationForm';
import VacationList from '@/components/vacations/VacationList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeList from '@/components/employees/EmployeeList';
import DashboardTab from '@/components/dashboard/DashboardTab';
import CalendarView from '@/components/calendar/CalendarView';
import { useAuth } from './AuthProvider';
import type { Demand, Vacation, DemandStatus, Employee, MedicalCertificate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ListChecks, CalendarCheck, PlusCircle, Users, LayoutDashboard, Calendar as CalendarIconLucide, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  addDemand, 
  updateDemand as updateDbDemand, 
  deleteDemand as deleteDbDemand,
  addVacation,
  updateVacation as updateDbVacation,
  deleteVacation as deleteDbVacation,
  addEmployee,
  updateEmployee as updateDbEmployee,
  deleteEmployee as deleteDbEmployee,
  addCertificate as addDbCertificate,
  deleteCertificate as deleteDbCertificate,
  updateCertificate
} from '@/lib/idb';
import { sendNotification } from '@/ai/flows/send-notification-flow';


export default function GestaoFeriasPage() {
  const { 
    demands, setDemands, 
    vacations, setVacations,
    employees, setEmployees,
    certificates, setCertificates
  } = useAuth();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  const tabOptions = [
    { value: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
    { value: "calendar", label: "Calendário", icon: <CalendarIconLucide className="mr-2 h-5 w-5" /> },
    { value: "demands", label: "Demandas", icon: <ListChecks className="mr-2 h-5 w-5" /> },
    { value: "vacations", label: "Férias", icon: <CalendarCheck className="mr-2 h-5 w-5" /> },
    { value: "employees", label: "Funcionários", icon: <Users className="mr-2 h-5 w-5" /> },
  ];

  const handleAddDemand = (demandData: Omit<Demand, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newDemand: Demand = { ...demandData, id: tempId };
    const originalDemands = [...demands];

    setDemands(prev => [newDemand, ...prev]);
    setShowDemandForm(false);
    toast({ title: "Demanda Adicionada", description: "A demanda foi salva com sucesso." });
    
    addDemand(demandData)
      .then(savedDemand => {
        setDemands(prev => prev.map(d => d.id === tempId ? savedDemand : d));
      })
      .catch(error => {
        console.error("Failed to add demand:", error);
        toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível salvar a demanda.' });
        setDemands(originalDemands);
      });
  };

  const handleUpdateDemand = (updatedDemand: Demand) => {
    const originalDemands = [...demands];
    setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
    
    updateDbDemand(updatedDemand).catch(error => {
      console.error("Failed to update demand:", error);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível atualizar a demanda.' });
      setDemands(originalDemands);
    });
  };

  const handleDeleteDemand = (id: string) => {
    const originalDemands = [...demands];
    const demandToDelete = demands.find(d => d.id === id);
    
    setDemands(prev => prev.filter(d => d.id !== id));
    toast({ title: "Demanda Excluída", description: "A demanda foi removida." });

    if (demandToDelete) {
      deleteDbDemand(id).catch(error => {
        console.error("Failed to delete demand:", error);
        toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível excluir a demanda.' });
        setDemands(originalDemands);
      });
    }
  };

  const handleUpdateDemandStatus = (id: string, status: DemandStatus) => {
    const demandToUpdate = demands.find(d => d.id === id);
    if(demandToUpdate) {
      const updatedDemand = { ...demandToUpdate, status };
      handleUpdateDemand(updatedDemand);
      toast({ title: "Status Atualizado", description: `Status da demanda alterado.`});

      // Send notification if finalized
      if (status === 'finalizado') {
        const owner = employees.find(e => e.id === updatedDemand.ownerId);
        if (owner?.fcmTokens && owner.fcmTokens.length > 0) {
            owner.fcmTokens.forEach(token => {
                sendNotification({
                    token,
                    title: 'Demanda Finalizada!',
                    body: `A demanda "${updatedDemand.title}" foi concluída.`
                }).catch(console.error);
            });
        }
      }
    }
  };

  const handleAddVacation = (vacationData: Omit<Vacation, 'id'>) => {
    const tempId = `temp-vacation-${Date.now()}`;
    const newVacation: Vacation = { ...vacationData, id: tempId };
    const originalVacations = [...vacations];

    setVacations(prev => [newVacation, ...prev]);
    setShowVacationForm(false);
    toast({ title: "Férias Adicionadas", description: "Sincronizando com a nuvem..." });
    
    addVacation(vacationData)
      .then(savedVacation => {
        setVacations(prev => prev.map(v => v.id === tempId ? savedVacation : v));
      })
      .catch(error => {
       console.error("Failed to add vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar as férias.' });
       setVacations(originalVacations);
    });
  };
  
  const handleUpdateVacation = (updatedVacation: Vacation) => {
    const originalVacations = [...vacations];
    setVacations(prev => prev.map(v => v.id === updatedVacation.id ? updatedVacation : v));

    updateDbVacation(updatedVacation).catch(error => {
       console.error("Failed to update vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar as férias.' });
       setVacations(originalVacations);
    });
  };

  const handleDeleteVacation = (id: string) => {
    const originalVacations = [...vacations];
    setVacations(prev => prev.filter(v => v.id !== id));
    toast({ title: "Férias Excluídas", description: "O registro de férias foi removido." });

    deleteDbVacation(id).catch(error => {
       console.error("Failed to delete vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir as férias.' });
       setVacations(originalVacations);
    });
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const tempId = `temp-employee-${Date.now()}`;
    const newEmployee: Employee = { ...employeeData, id: tempId };
    const originalEmployees = [...employees];

    setEmployees(prev => [newEmployee, ...prev]);
    setShowEmployeeForm(false);
    toast({ title: "Funcionário Adicionado", description: "Sincronizando..." });

    addEmployee(employeeData)
      .then(savedEmployee => {
        setEmployees(prev => prev.map(e => e.id === tempId ? savedEmployee : e));
      })
      .catch(error => {
       console.error("Failed to add employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o funcionário.' });
       setEmployees(originalEmployees);
    });
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    const originalEmployees = [...employees];
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));

    updateDbEmployee(updatedEmployee).catch(error => {
       console.error("Failed to update employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o funcionário.' });
       setEmployees(originalEmployees);
    });
  };

  const handleDeleteEmployee = (id: string) => {
    const originalEmployees = [...employees];
    const originalCertificates = [...certificates];
    
    const relatedCerts = certificates.filter(c => c.employeeId === id);
    
    setEmployees(prev => prev.filter(e => e.id !== id));
    setCertificates(prev => prev.filter(c => c.employeeId !== id));
    toast({ title: "Funcionário Excluído", description: "O registro do funcionário e seus atestados foram removidos." });

    deleteDbEmployee(id).then(() => {
        const deletePromises = relatedCerts.map(cert => deleteDbCertificate(cert.id));
        return Promise.all(deletePromises);
    })
    .catch(error => {
      console.error("Failed to delete employee or their certificates:", error);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível excluir o funcionário.' });
      setEmployees(originalEmployees);
      setCertificates(originalCertificates);
    });
  };

  const handleAddCertificate = (certificateData: Omit<MedicalCertificate, 'id'>) => {
    const tempId = `temp-cert-${Date.now()}`;
    const newCertificate: MedicalCertificate = { ...certificateData, id: tempId };
    const originalCertificates = [...certificates];

    setCertificates(prev => [newCertificate, ...prev]);
    toast({ title: "Atestado Adicionado", description: "Sincronizando..." });

    addDbCertificate(certificateData)
      .then(savedCertificate => {
        setCertificates(prev => prev.map(c => c.id === tempId ? savedCertificate : c));
      })
      .catch(error => {
       console.error("Failed to add certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o atestado.' });
       setCertificates(originalCertificates);
    });
  };
  
  const handleDeleteCertificate = (id: string) => {
    const originalCertificates = [...certificates];
    setCertificates(prev => prev.filter(c => c.id !== id));
    toast({ title: "Atestado Excluído", description: "O registro do atestado foi removido." });

    deleteDbCertificate(id).catch(error => {
       console.error("Failed to delete certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o atestado.' });
       setCertificates(originalCertificates);
    });
  };

  return (
    <div className="w-full space-y-8 mt-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center">
            <TabsList className="grid w-full grid-cols-5 md:w-5/6 mx-auto">
                {tabOptions.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.icon} {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center px-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Menu className="mr-2 h-5 w-5" />
                        {tabOptions.find(t => t.value === activeTab)?.label || 'Menu'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width]]">
                    {tabOptions.map(tab => (
                         <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}>
                            {tab.icon} {tab.label}
                         </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <DashboardTab demands={demands} employees={employees} certificates={certificates} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <CalendarView demands={demands} vacations={vacations} />
        </TabsContent>

        <TabsContent value="demands" className="space-y-6 mt-6">
          <section aria-labelledby="demands-form-section-title">
            <div className="flex justify-between items-center mb-4">
              <h2 id="demands-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Nova Demanda</h2>
              <Button variant="outline" onClick={() => setShowDemandForm(!showDemandForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showDemandForm ? 'Ocultar' : 'Adicionar'}
              </Button>
            </div>
            {showDemandForm && (
              <DemandForm 
                onAddDemand={handleAddDemand} 
                onClose={() => setShowDemandForm(false)} 
                employees={employees}
              />
            )}
          </section>
          <section aria-labelledby="demands-list-title">
            <h2 id="demands-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Demandas</h2>
            <DemandList 
              demands={demands} 
              onUpdateStatus={handleUpdateDemandStatus} _
              onDeleteDemand={handleDeleteDemand}
              onUpdateDemand={handleUpdateDemand}
              employees={employees}
            />
          </section>
        </TabsContent>

        <TabsContent value="vacations" className="space-y-6 mt-6">
          <section aria-labelledby="vacations-form-section-title">
              <div className="flex justify-between items-center mb-4">
              <h2 id="vacations-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novas Férias</h2>
              <Button variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showVacationForm ? 'Ocultar' : 'Adicionar'}
              </Button>
            </div>
            {showVacationForm && (
              <VacationForm 
                onAddVacation={handleAddVacation} 
                onClose={() => setShowVacationForm(false)} 
              />
            )}
          </section>
          <section aria-labelledby="vacations-list-title">
            <h2 id="vacations-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Calendário de Férias</h2>
            <VacationList 
              vacations={vacations} 
              demands={demands}
              onDeleteVacation={handleDeleteVacation}
              onUpdateVacation={handleUpdateVacation}
            />
          </section>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6 mt-6">
          <section aria-labelledby="employees-form-section-title">
              <div className="flex justify-between items-center mb-4">
              <h2 id="employees-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novo Funcionário</h2>
              <Button variant="outline" onClick={() => setShowEmployeeForm(!showEmployeeForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showEmployeeForm ? 'Ocultar' : 'Adicionar'}
              </Button>
            </div>
            {showEmployeeForm && (
              <EmployeeForm 
                onAddEmployee={handleAddEmployee} _
                onClose={() => setShowEmployeeForm(false)} />
            )}
          </section>
          <section aria-labelledby="employees-list-title">
            <h2 id="employees-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Funcionários</h2>
            <EmployeeList 
              employees={employees}
              certificates={certificates}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onAddCertificate={handleAddCertificate}
              onDeleteCertificate={handleDeleteCertificate}
            />
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}
