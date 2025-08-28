import React from 'react';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';
import { getAllData } from '@/lib/idb';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch data on the server side
  const initialData = await getAllData();

  return (
    <>
      <AppHeader />
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <GestaoFeriasPage initialData={initialData} />
      </div>
    </>
  );
}
