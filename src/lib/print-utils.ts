
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';

export function renderReport(reportComponent: React.ReactElement, title: string) {
  const staticMarkup = renderToStaticMarkup(reportComponent);
  const newWindow = window.open('', title, 'width=800,height=600');
  
  if (newWindow) {
    newWindow.document.write('<!DOCTYPE html>' + staticMarkup);
    newWindow.document.close();

    // Adiciona um pequeno atraso para garantir que o conteúdo seja totalmente carregado antes de imprimir
    setTimeout(() => {
      newWindow.focus();
      newWindow.print();
      // Opcional: fechar a janela após a impressão. Pode ser comentado se preferir mantê-la aberta.
      // newWindow.close(); 
    }, 500);
  } else {
    alert('Por favor, habilite pop-ups para gerar o relatório.');
  }
}
