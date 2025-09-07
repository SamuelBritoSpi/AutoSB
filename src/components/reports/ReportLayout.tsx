
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Briefcase } from 'lucide-react';

interface ReportLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function ReportLayout({ title, children }: ReportLayoutProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <title>{title} - Relatório AutoSB</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
          
          body {
            font-family: 'PT Sans', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #3F51B5;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .report-header h1 {
            font-size: 2rem;
            color: #3F51B5;
            margin: 0;
            font-weight: 700;
          }
          .report-header .logo {
             display: flex;
             align-items: center;
             font-size: 1.5rem;
             font-weight: bold;
             color: #3F51B5;
          }
           .report-header .logo svg {
              width: 2rem;
              height: 2rem;
              margin-right: 0.5rem;
           }
          .report-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #ccc;
            font-size: 0.8rem;
            color: #777;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #F0F2F5;
            font-weight: bold;
            color: #3F51B5;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
           h2 {
            font-size: 1.5rem;
            color: #3F51B5;
            border-bottom: 1px solid #C5CAE9;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }

          @media print {
            body {
              background-color: #fff;
            }
            .report-container {
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 0;
              max-width: 100%;
            }
             h2 {
                page-break-before: auto;
                page-break-after: avoid;
             }
             table {
                page-break-inside: auto;
             }
             tr {
                page-break-inside: avoid;
                page-break-after: auto;
             }
          }
        `}</style>
      </head>
      <body>
        <div className="report-container">
          <header className="report-header">
            <div className="logo">
                <Briefcase />
                <span>AutoSB</span>
            </div>
            <h1>{title}</h1>
          </header>
          <main>
            {children}
          </main>
          <footer className="report-footer">
            <p>Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
            <p>Gerado por AutoSB - Responsável: Samuel Brito de Oliveira Silva</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
