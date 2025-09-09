
"use client";

import AppHeader from '@/components/AppHeader';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';

export default function HomePage() {
  
  return (
    <>
      <AppHeader />
      <main className="flex-grow w-full">
        <GestaoFeriasPage />
      </main>
    </>
  );
}
