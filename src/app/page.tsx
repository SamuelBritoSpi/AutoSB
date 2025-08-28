
"use client";
import React from 'react';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';
import withAuth from '@/components/withAuth';

function HomePage() {
    return <GestaoFeriasPage />;
}

export default withAuth(HomePage);
