
"use client";

import AppHeader from '@/components/AppHeader';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';

export default function HomePage() {
  
  return (
    <>
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <GestaoFeriasPage />
      </main>
    </>
  );
}
