"use client";

import React from 'react';
import ThirdPartyEmployeePage from '@/components/employees/ThirdPartyEmployeePage';
import type { ThirdPartyEmployee, School } from '@/lib/types';

const schools: School[] = [
  { id: 's1', name: 'COLEGIO ESTADUAL ANISIO TEIXEIRA' },
  { id: 's2', name: 'COLEGIO ESTADUAL ANTONIO GONCALVES' },
  { id: 's3', name: 'COLÉGIO ESTADUAL DE TEMPO INTEGRAL DE VITÓRIA DA CONQUISTA' },
  { id: 's4', name: 'COLEGIO ESTADUAL JORGE AMADO' },
  { id: 's5', name: 'COLEGIO ESTADUAL JOSE SA NUNES' },
  { id: 's6', name: 'COLÉGIO ESTADUAL DOM CLIMÉRIO ALMEIDA DE ANDRADE TEMPO INTEGRAL' },
  { id: 's7', name: 'CENTRO TERRITORIAL DE EDUCACAO PROFISSIONAL DE VITORIA DA CONQUISTA' },
  { id: 's8', name: 'COLEGIO DA POLICIA MILITAR - CPM ERALDO TINOCO' },
  { id: 's9', name: 'Col. Estadual de Tempo Integral de Cândido Sales' },
  { id: 's10', name: 'Col. Estadual de Tempo Integral de Anagé' },
  { id: 's11', name: 'COLEGIO ESTADUAL ZULEIDE FREIRE DE ABREU' },
  { id: 's12', name: 'SEDE NTE 20' },
];

const employees: ThirdPartyEmployee[] = [
  {
    id: 'e1',
    nte: 'NTE 20',
    municipio: 'Vitória da Conquista',
    schoolId: 's1',
    schoolName: 'COLEGIO ESTADUAL ANISIO TEIXEIRA',
    codSec: '1125496',
    name: 'FUNCIONARIO TESTE DA SILVA',
    cpf: '12345678901',
    role: 'Auxiliar de Serviços Gerais',
    contact: '(77) 99999-0000',
    company: 'CONFIANÇA',
    status: 'Ativo',
    admissionDate: '2024-01-10T00:00:00.000Z',
    observation: '',
    contractType: '001/2024',
    history: [],
  },
];

export default function TestFormPage() {
  return (
    <div className="p-6">
      <ThirdPartyEmployeePage
        employees={employees}
        schools={schools}
        onAddEmployee={() => {}}
        onUpdateEmployee={() => {}}
        onDeleteEmployee={() => {}}
        onAddSchool={async (name) => ({ id: `new-${Date.now()}`, name })}
        onOpenSchoolManagement={() => {}}
      />
    </div>
  );
}
