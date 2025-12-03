
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

/**
 * Gera comandos automáticos para limpeza de arquivos grandes específicos do AutoSB.
 * - options.repoUrl: URL do repositório (ex.: git@github.com:usuario/repo.git) para comandos de mirror
 * - options.branch: branch principal (padrão: main)
 */
export function generateAutoSBCleanupCommands(options?: { repoUrl?: string; branch?: string }) {
  const paths = [
    'dist/win-unpacked/AutoSB.exe',
    'dist/win-unpacked/resources/app.asar.unpacked',
    'dist/win-unpacked/resources/app.asar',
  ];

  const repoUrl = options?.repoUrl ?? '<REPO_URL>';
  const mainBranch = options?.branch ?? 'main';

  const identify = [
    '# Identificar blobs maiores no histórico',
    'git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)" | sed -n \'s/^blob //p\' | sort -r -n -k2 | head -n 50',
  ].join('\n');

  const ignoreDist = [
    '# Ignorar dist/ (adicione ao .gitignore para próximos commits)',
    'echo "dist/" >> .gitignore',
    'git add .gitignore',
    'git commit -m "Add dist to .gitignore"',
  ].join('\n');

  const removeFromLastCommit = [
    '# Remover do último commit (se o arquivo só estiver nele)',
    'git rm -r --cached dist/win-unpacked',
    'git commit --amend --no-edit',
    `git push --force origin ${mainBranch}`,
  ].join('\n');

  const filterRepoCmd = [
    '# Reescrever histórico com git-filter-repo (recomendado para commits antigos)',
    `git clone --mirror ${repoUrl}`,
    `cd $(basename ${repoUrl} .git).git`,
    `git filter-repo --invert-paths ${paths.map((p) => `--path "${p}"`).join(' ')} --force`,
    'git push --force --all',
    'git push --force --tags',
  ].join('\n');

  const bfgCmd = [
    '# Alternativa: BFG Repo-Cleaner',
    `git clone --mirror ${repoUrl}`,
    `java -jar bfg.jar --delete-files "${paths.map((p) => p.split('/').slice(-1)[0]).join(',')}" $(basename ${repoUrl} .git).git`,
    'cd $(basename ${repoUrl} .git).git',
    'git reflog expire --expire=now --all && git gc --prune=now --aggressive',
    'git push',
  ].join('\n');

  const gitLfsCmd = [
    '# Migrar para Git LFS (se quiser manter os arquivos fora do git tradicional)',
    'git lfs install',
    'git lfs track "dist/**"',
    'git add .gitattributes',
    'git commit -m "Track dist with Git LFS"',
    `git lfs migrate import --include="dist/**" --include-ref=refs/heads/${mainBranch}`,
    `git push --force origin ${mainBranch}`,
  ].join('\n');

  const cleanupAfter = [
    '# Pós-ação: instruções para a equipe (reclonar ou resetar seus repositórios locais)',
    'Avisar a equipe para re-clonar/redefinir seus repositórios locais:',
    'git fetch origin',
    `git reset --hard origin/${mainBranch}`,
    'git reflog expire --expire=now --all && git gc --prune=now --aggressive',
  ].join('\n');

  return {
    identify,
    ignoreDist,
    removeFromLastCommit,
    filterRepoCmd,
    bfgCmd,
    gitLfsCmd,
    cleanupAfter,
    paths,
  };
}
