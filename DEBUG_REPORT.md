# 🚨 ALERTA DE SEGURANÇA: Credenciais Expostas

Suas variáveis de ambiente foram detectadas no histórico do GitHub. Siga estes passos imediatamente para proteger sua aplicação.

## 1. Rotacionar Chaves (MAIS IMPORTANTE)
Como as chaves foram expostas, elas não são mais seguras.
1. Vá ao [Console do Firebase](https://console.firebase.google.com/) > Configurações do Projeto > Contas de Serviço > Chaves de API.
2. Gere uma nova chave e desative a antiga.
3. Vá ao [Google AI Studio](https://aistudio.google.com/) e gere uma nova `GOOGLE_API_KEY`.

## 2. Limpar o Histórico do Git
Para remover o arquivo `.env` de todos os seus commits passados, execute no seu terminal local:

```bash
# Instale o BFG Repo-Cleaner ou use este comando nativo (mais lento):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force o push para o GitHub (isso reescreverá a história do repo)
git push origin --force --all
```

## 3. Configurar a Vercel
Não envie o arquivo `.env` para a Vercel. Em vez disso:
1. Vá ao painel da Vercel > Seu Projeto > Settings > Environment Variables.
2. Adicione cada variável listada no `.env.example` manualmente lá.

---
**Status da Remediação**: 
- `.gitignore` atualizado: ✅
- `.env.example` criado: ✅
- Chaves rotacionadas: ⚠️ (Aguardando ação do usuário)
