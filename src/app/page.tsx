
"use client";

import { useEffect, useState } from 'react';
import { getAllData } from '@/lib/idb';
import type { Demand, Vacation, Employee, MedicalCertificate } from '@/lib/types';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';
import AppHeader from '@/components/AppHeader';
import { Loader2 } from 'lucide-react';

interface AppData {
  demands: Demand[];
  vacations: Vacation[];
  employees: Employee[];
  certificates: MedicalCertificate[];
}

export default function HomePage() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const initialData = await getAllData();
        setData(initialData);
      } catch (error) {
        console.error("Failed to load data:", error);
        // Optionally, show a toast message for data loading errors
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-semibold">Carregando dados...</p>
          <p className="text-muted-foreground">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <GestaoFeriasPage initialData={data} />
      </main>
    </>
  );
}
