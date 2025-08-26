
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DemandForm from '@/components/demands/DemandForm';
import DemandList from '@/components/demands/DemandList';
import VacationForm from '@/components/vacations/VacationForm';
import VacationList from '@/components/vacations/VacationList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeList from '@/components/employees/EmployeeList';

import type { Demand, Vacation, DemandStatus, Employee, MedicalCertificate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ListChecks, CalendarCheck, PlusCircle, Users } from 'lucide-react';
import AppHeader from '@/components/AppHeader'; 
import { Button } from '@/components/ui/button';
import { 
  addDemand, 
  getDemands, 
  updateDemand as updateDbDemand, 
  deleteDemand as deleteDbDemand,
  addVacation,
  getVacations,
  updateVacation as updateDbVacation,
  deleteVacation as deleteDbVacation,
  addEmployee,
  getEmployees,
  updateEmployee as updateDbEmployee,
  deleteEmployee as deleteDbEmployee,
  addCertificate,
  getCertificates,
  deleteCertificate as deleteDbCertificate
} from '@/lib/idb';


export default function GestaoFeriasPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demands");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedDemands, loadedVacations, loadedEmployees, loadedCertificates] = await Promise.all([
          getDemands(),
          getVacations(),
          getEmployees(),
          getCertificates()
        ]);
        setDemands(loadedDemands);
        setVacations(loadedVacations);
        setEmployees(loadedEmployees);
        setCertificates(loadedCertificates);
        toast({ title: 'Dados Carregados', description: 'Seus dados locais foram carregados com sucesso.'});
      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
        toast({ variant: 'destructive', title: 'Erro ao Carregar Dados', description: 'Não foi possível carregar os dados do banco de dados local.' });
      }
    }
    loadData();
  }, []);

  const handleAddDemand = async (newDemand: Demand) => {
    try {
      await addDemand(newDemand);
      setDemands(prev => [newDemand, ...prev]);
      setShowDemandForm(false);
    } catch (error) {
       console.error("Failed to add demand:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a demanda.' });
    }
  };

  const handleUpdateDemand = async (updatedDemand: Demand) => {
    try {
      await updateDbDemand(updatedDemand);
      setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
    } catch (error) {
       console.error("Failed to update demand:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a demanda.' });
    }
  };

  const handleDeleteDemand = async (id: string) => {
    try {
      await deleteDbDemand(id);
      setDemands(prev => prev.filter(d => d.id !== id));
      toast({ title: "Demanda Excluída", description: "A demanda foi removida." });
    } catch (error) {
       console.error("Failed to delete demand:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a demanda.' });
    }
  };

  const handleUpdateDemandStatus = async (id: string, status: DemandStatus) => {
    const demandToUpdate = demands.find(d => d.id === id);
    if(demandToUpdate) {
      const updatedDemand = { ...demandToUpdate, status };
      await handleUpdateDemand(updatedDemand);
      toast({ title: "Status Atualizado", description: `Status da demanda alterado para ${status}.`});
    }
  };

  const handleAddVacation = async (newVacation: Vacation) => {
    try {
      await addVacation(newVacation);
      setVacations(prev => [newVacation, ...prev]);
      setShowVacationForm(false);
    } catch (error) {
       console.error("Failed to add vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar as férias.' });
    }
  };
  
  const handleUpdateVacation = async (updatedVacation: Vacation) => {
    try {
      await updateDbVacation(updatedVacation);
      setVacations(prev => prev.map(v => v.id === updatedVacation.id ? updatedVacation : v));
    } catch (error) {
       console.error("Failed to update vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar as férias.' });
    }
  };

  const handleDeleteVacation = async (id: string) => {
    try {
      await deleteDbVacation(id);
      setVacations(prev => prev.filter(v => v.id !== id));
      toast({ title: "Férias Excluídas", description: "O registro de férias foi removido." });
    } catch (error) {
       console.error("Failed to delete vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir as férias.' });
    }
  };

  const handleAddEmployee = async (newEmployee: Employee) => {
    try {
      await addEmployee(newEmployee);
      setEmployees(prev => [newEmployee, ...prev]);
      setShowEmployeeForm(false);
    } catch (error) {
       console.error("Failed to add employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o funcionário.' });
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateDbEmployee(updatedEmployee);
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    } catch (error) {
       console.error("Failed to update employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o funcionário.' });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteDbEmployee(id);
      // Also delete related certificates
      const relatedCertificates = certificates.filter(c => c.employeeId === id);
      for (const cert of relatedCertificates) {
        await deleteDbCertificate(cert.id);
      }
      setEmployees(prev => prev.filter(e => e.id !== id));
      setCertificates(prev => prev.filter(c => c.employeeId !== id));
      toast({ title: "Funcionário Excluído", description: "O registro do funcionário e seus atestados foram removidos." });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o funcionário.' });
    }
  };

  const handleAddCertificate = async (newCertificate: MedicalCertificate) => {
    try {
      await addCertificate(newCertificate);
      setCertificates(prev => [newCertificate, ...prev]);
    } catch (error) {
       console.error("Failed to add certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o atestado.' });
    }
  };
  
  const handleDeleteCertificate = async (id: string) => {
    try {
      await deleteDbCertificate(id);
      setCertificates(prev => prev.filter(c => c.id !== id));
      toast({ title: "Atestado Excluído", description: "O registro do atestado foi removido." });
    } catch (error) {
       console.error("Failed to delete certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o atestado.' });
    }
  };

  return (
    <>
      <AppHeader />
      <div className="w-full space-y-8 mt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-2/3 mx-auto">
            <TabsTrigger value="demands">
              <ListChecks className="mr-2 h-5 w-5" /> Demandas
            </TabsTrigger>
            <TabsTrigger value="vacations">
              <CalendarCheck className="mr-2 h-5 w-5" /> Férias
            </TabsTrigger>
             <TabsTrigger value="employees">
              <Users className="mr-2 h-5 w-5" /> Funcionários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demands" className="space-y-6 mt-6">
            <section aria-labelledby="demands-form-section-title">
              <div className="flex justify-between items-center mb-4">
                <h2 id="demands-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Nova Demanda</h2>
                <Button variant="outline" onClick={() => setShowDemandForm(!showDemandForm)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {showDemandForm ? 'Ocultar Formulário' : 'Adicionar Demanda'}
                </Button>
              </div>
              {showDemandForm && (
                <DemandForm 
                  onAddDemand={handleAddDemand} 
                  onClose={() => setShowDemandForm(false)} 
                />
              )}
            </section>
            <section aria-labelledby="demands-list-title">
              <h2 id="demands-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Demandas</h2>
              <DemandList 
                demands={demands} 
                onUpdateStatus={handleUpdateDemandStatus} 
                onDeleteDemand={handleDeleteDemand}
                onUpdateDemand={handleUpdateDemand}
              />
            </section>
          </TabsContent>

          <TabsContent value="vacations" className="space-y-6 mt-6">
            <section aria-labelledby="vacations-form-section-title">
               <div className="flex justify-between items-center mb-4">
                <h2 id="vacations-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novas Férias</h2>
                <Button variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {showVacationForm ? 'Ocultar Formulário' : 'Adicionar Férias'}
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
                  <PlusCircle className="mr-2 h-4 w-4" /> {showEmployeeForm ? 'Ocultar Formulário' : 'Adicionar Funcionário'}
                </Button>
              </div>
              {showEmployeeForm && (
                <EmployeeForm 
                  onAddEmployee={handleAddEmployee} 
                  onClose={() => setShowEmployeeForm(false)} 
                />
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
    </>
  );
}
