
"use client";

import React, { useState, useRef } from 'react';
import type { ThirdPartyEmployee, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as ShadCnCard, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2, PlusCircle, Building2, FileUp, Loader2, RefreshCw } from 'lucide-react';
import ThirdPartyEmployeeForm from './ThirdPartyEmployeeForm';
import ThirdPartyEmployeeList from './ThirdPartyEmployeeList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ReportDialog from '../reports/ReportDialog';
import { parseEmployeesExcel } from '@/lib/excel-utils';
import { useToast } from '@/hooks/use-toast';
import { syncEmployeeToGoogleSheets } from '@/lib/google-sync';

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<ThirdPartyEmployee | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await parseEmployeesExcel(file, schools);
      
      for (const emp of importedData) {
        onAddEmployee(emp);
      }

      toast({
        title: "Importação Concluída",
        description: `${importedData.length} funcionários foram adicionados ao sistema.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Erro na Importação",
        description: "Não foi possível ler o arquivo Excel. Verifique o formato.",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGoogleSheetsSync = async () => {
    setIsSyncing(true);
    toast({ title: "Iniciando Sincronização", description: "Enviando base de dados para o Google Sheets..." });
    
    let successCount = 0;
    try {
        for (const emp of employees) {
            const ok = await syncEmployeeToGoogleSheets(emp);
            if (ok) successCount++;
        }
        
        toast({
            title: "Sincronização Concluída",
            description: `${successCount} de ${employees.length} registros atualizados no Google Sheets.`,
        });
    } catch (error) {
        toast({ variant: 'destructive', title: "Erro na Sincronização" });
    } finally {
        setIsSyncing(false);
    }
  };

  const handleAddWithSync = (data: Omit<ThirdPartyEmployee, 'id'>) => {
      // Fecha o form imediatamente
      setShowForm(false);
      // Salva localmente
      onAddEmployee(data);
      
      // Sincroniza em background
      const empWithDummyId: ThirdPartyEmployee = { ...data, id: `temp-${Date.now()}` };
      syncEmployeeToGoogleSheets(empWithDummyId).then(ok => {
          if (!ok) {
              console.warn("Google Sheets Offline ou sem permissão.");
          }
      });
  };

  const handleUpdateWithSync = (data: ThirdPartyEmployee) => {
      // Fecha o modal imediatamente para evitar travamento da UI
      setEditingEmp(null);
      // Salva localmente
      onUpdateEmployee(data);
      
      // Tenta sincronizar em background
      syncEmployeeToGoogleSheets(data).then(ok => {
          if (!ok) {
              toast({ 
                  variant: 'destructive', 
                  title: "Atenção na Sincronização", 
                  description: "Alteração salva localmente, mas falhou ao enviar para a planilha online." 
              });
          }
      }).catch(err => {
          console.error("Erro silencioso na sincronização:", err);
      });
  };

  return (
    <div className="space-y-6">
      <ShadCnCard className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
              <UserCircle2 className="h-6 w-6" />
              Gestão de Funcionários Terceirizados
            </CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                Importar Planilha Inicial
              </Button>
              <Button variant="outline" size="sm" onClick={handleGoogleSheetsSync} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sincronizar Google Sheets
              </Button>
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
            onAddEmployee={handleAddWithSync}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <ThirdPartyEmployeeList
        employees={employees}
        onEdit={setEditingEmp}
        onDelete={onDeleteEmployee}
        onOpenReport={() => setIsReportDialogOpen(true)}
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
              onUpdateEmployee={handleUpdateWithSync}
              onAddEmployee={() => {}}
              onClose={() => setEditingEmp(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ReportDialog 
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportType="third-party"
        thirdPartyEmployees={employees}
        schools={schools}
      />
    </div>
  );
}
