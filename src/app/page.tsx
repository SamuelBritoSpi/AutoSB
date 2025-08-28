
"use client";
import React from 'react';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';
import withAuth from '@/components/withAuth';
import type { Demand, Vacation, Employee, MedicalCertificate } from '@/lib/types';


interface HomePageProps {
    initialData: {
        demands: Demand[];
        vacations: Vacation[];
        employees: Employee[];
        certificates: MedicalCertificate[];
    }
}


function HomePage({ initialData }: HomePageProps) {
    return <GestaoFeriasPage initialData={initialData} />;
}

export default withAuth(HomePage);
