"use client";

import type { Employee, MedicalCertificate } from '@/lib/types';
import MedicalCertificateForm from './MedicalCertificateForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeCertificates } from '@/lib/certificate-logic';
import { Badge } from '../ui/badge';

interface MedicalCertificateListProps {
  employee: Employee;
  certificates: MedicalCertificate[];
  onAddCertificate: (certificate: MedicalCertificate) => void;
  onDeleteCertificate: (id: string) => void;
}

export default function MedicalCertificateList({ employee, certificates, onAddCertificate, onDeleteCertificate }: MedicalCertificateListProps) {
  
  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => parseISO(b.certificateDate).getTime() - parseISO(a.certificateDate).getTime());
  }, [certificates]);

  const analysis = useMemo(() => analyzeCertificates(certificates, employee.contractType), [certificates, employee.contractType]);

  const getAlertVariant = () => {
    switch (analysis.status) {
      case 'Encaminhar ao INSS':
      case 'Encaminhar ao SEI':
        return 'destructive';
      default:
        return 'default';
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant={getAlertVariant()}>
        <AlertTitle>Análise do Período (Últimos 60 dias)</AlertTitle>
        <AlertDescription>
          <p>
            Total de dias de atestado acumulados: <span className="font-bold">{analysis.totalDaysInWindow} / {analysis.limit}</span>
          </p>
          <p>
            Status: <span className="font-bold">{analysis.status}</span>
          </p>
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-lg font-medium mb-2">Registrar Novo Atestado</h3>
        <MedicalCertificateForm 
          employeeId={employee.id} 
          onAddCertificate={onAddCertificate} 
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Histórico de Atestados</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Original</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCertificates.length > 0 ? (
                sortedCertificates.map(cert => (
                  <TableRow key={cert.id}>
                    <TableCell>{format(parseISO(cert.certificateDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>
                      {cert.isHalfDay ? <Badge variant="secondary">Meio Turno</Badge> : `${cert.days} dia(s)`}
                    </TableCell>
                    <TableCell>{cert.originalReceived ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onDeleteCertificate(cert.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Nenhum atestado registrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
