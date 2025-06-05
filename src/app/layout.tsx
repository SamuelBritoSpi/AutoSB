import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// AppHeader will be rendered in page.tsx to pass props
// import AppHeader from '@/components/AppHeader'; 

export const metadata: Metadata = {
  title: 'AutoSB',
  description: 'Sistema para controle de demandas e férias',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {/* AppHeader moved to page.tsx to handle import/export functions */}
        <main className="flex-grow container mx-auto p-4 md:p-6">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
