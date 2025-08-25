
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

const DEMANDS_STORAGE_KEY = 'autoSb_demands';
const VACATIONS_STORAGE_KEY = 'autoSb_vacations';
const EMPLOYEES_STORAGE_KEY = 'autoSb_employees';
const CERTIFICATES_STORAGE_KEY = 'autoSb_certificates';


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
    const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
    if (storedDemands) {
      try {
        const parsedDemands = JSON.parse(storedDemands);
        if(Array.isArray(parsedDemands)) setDemands(parsedDemands);
      } catch (e) {
        console.error("Failed to parse demands from localStorage", e);
        setDemands([]);
      }
    }
    const storedVacations = localStorage.getItem(VACATIONS_STORAGE_KEY);
    if (storedVacations) {
      try {
        const parsedVacations = JSON.parse(storedVacations);
        if(Array.isArray(parsedVacations)) setVacations(parsedVacations);
      } catch (e) {
        console.error("Failed to parse vacations from localStorage", e);
        setVacations([]);
      }
    }
    const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (storedEmployees) {
      try {
        const parsedEmployees = JSON.parse(storedEmployees);
        if(Array.isArray(parsedEmployees)) setEmployees(parsedEmployees);
      } catch (e) {
        console.error("Failed to parse employees from localStorage", e);
        setEmployees([]);
      }
    }
    const storedCertificates = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
    if (storedCertificates) {
        try {
            const parsed = JSON.parse(storedCertificates);
            if(Array.isArray(parsed)) setCertificates(parsed);
        } catch (e) {
            console.error("Failed to parse certificates from localStorage", e);
            setCertificates([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem(VACATIONS_STORAGE_KEY, JSON.stringify(vacations));
  }, [vacations]);

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(certificates));
  }, [certificates]);

  const handleAddDemand = (newDemand: Demand) => {
    setDemands(prev => [newDemand, ...prev]);
    setShowDemandForm(false);
  };

  const handleUpdateDemand = (updatedDemand: Demand) => {
    setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
  };

  const handleDeleteDemand = (id: string) => {
    setDemands(prev => prev.filter(d => d.id !== id));
    toast({ title: "Demanda Excluída", description: "A demanda foi removida." });
  };

  const handleUpdateDemandStatus = (id: string, status: DemandStatus) => {
    setDemands(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    toast({ title: "Status Atualizado", description: `Status da demanda alterado para ${status}.`});
  };

  const handleAddVacation = (newVacation: Vacation) => {
    setVacations(prev => [newVacation, ...prev]);
    setShowVacationForm(false);
  };
  
  const handleUpdateVacation = (updatedVacation: Vacation) => {
    setVacations(prev => prev.map(v => v.id === updatedVacation.id ? updatedVacation : v));
  };

  const handleDeleteVacation = (id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
    toast({ title: "Férias Excluídas", description: "O registro de férias foi removido." });
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setShowEmployeeForm(false);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({ title: "Funcionário Excluído", description: "O registro do funcionário foi removido." });
  };

  const handleAddCertificate = (newCertificate: MedicalCertificate) => {
    setCertificates(prev => [newCertificate, ...prev]);
  };
  const handleDeleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
    toast({ title: "Atestado Excluído", description: "O registro do atestado foi removido." });
  };

  const handleExportData = () => {
    const dataToExport = { demands, vacations, employees, certificates };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "autoSb_data.json";
    link.click();
    toast({ title: "Dados Exportados", description: "Seus dados foram exportados como autoSb_data.json." });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result;
            if (typeof content === 'string') {
              const parsedData = JSON.parse(content);
              if (parsedData) {
                if (Array.isArray(parsedData.demands)) {
                  const validDemands = parsedData.demands.filter((d: any) => 
                    d.id && d.title && d.description && d.priority && d.dueDate && d.status
                  );
                  setDemands(validDemands);
                }
                 if (Array.isArray(parsedData.vacations)) {
                  const validVacations = parsedData.vacations.filter((v: any) =>
                    v.id && v.employeeName && v.startDate && v.endDate
                  );
                  setVacations(validVacations);
                }
                if (Array.isArray(parsedData.employees)) {
                  const validEmployees = parsedData.employees.filter((emp: any) =>
                    emp.id && emp.name && emp.contractType
                  );
                  setEmployees(validEmployees);
                }
                 if (Array.isArray(parsedData.certificates)) {
                  const validCertificates = parsedData.certificates.filter((cert: any) =>
                    cert.id && cert.employeeId && cert.certificateDate && cert.days !== undefined
                  );
                  setCertificates(validCertificates);
                }
                toast({ title: "Dados Importados", description: "Seus dados foram importados com sucesso." });
              } else {
                toast({ title: "Erro na Importação", description: "Formato de arquivo inválido.", variant: "destructive" });
              }
            }
          } catch (error) {
            toast({ title: "Erro na Importação", description: "Não foi possível ler o arquivo JSON.", variant: "destructive" });
            console.error("Import error:", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
      <AppHeader onExport={handleExportData} onImport={handleImportData} />
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
