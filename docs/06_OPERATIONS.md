---
idea: IDEA-010
doc: 06_OPERATIONS
version: 0.3.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-24
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Operações

## Deploy (DEC-001-032)

- App estático (`game/`, Vite build) → **Cloudflare Pages** (não é SSR — não usar OpenNext/Workers).
- Domínio alvo: `forge.guildeng.com`.
- Pipeline: `.github/workflows/deploy-cloudflare.yml` (padrão de `docs/deployment/README.md` da hub)
  — build em PR, deploy em push para `main`. Secrets por nome (nunca valor):
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`.
- Postura de custo: **R$0** — Cloudflare Pages free tier cobre o MVP inteiro (sem backend, sem DB).

⚠️ **Bloqueio ativo pra deploy real — ação pendente para Caio (HITL):** os secrets
`CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` já estão configurados no repo, mas o job `deploy`
falha desde o merge da primeira PR (2026-07-19) com `404 Project not found` — **não existe um
projeto Cloudflare Pages chamado `engineering-forge` na conta**. O job `build` (o que valida o
código) continua verde normalmente; só o passo de deploy falha, e vai falhar de novo em todo push
futuro pra `main` até isso ser resolvido. Precisa de acesso ao dashboard Cloudflare (fora do
alcance deste agente) para: (a) criar um projeto Pages chamado exatamente `engineering-forge`, ou
(b) ajustar `projectName:` em `.github/workflows/deploy-cloudflare.yml` pra um projeto existente.

## Ambientes

Sem ambientes de staging/produção separados no MVP — um único deploy estático. Preview deploys de
PR via Cloudflare Pages (automático, sem custo).

## Segurança

⚠️ **Ação pendente para Caio (HITL) — DEC-010-007:** uma credencial do MongoDB Atlas
(`caioasc_db_user`) esteve hardcoded em texto plano em `legacy/engineering-forge-v1` (4 arquivos),
em repositório público. Foi removida do código-fonte nesta sessão (substituída por variável de
ambiente), mas **permanece exposta no histórico do git** — rotacionar usuário/senha no MongoDB
Atlas é obrigatório e não pode ser feito por este agente.

Nenhum outro segredo é necessário no MVP (sem backend, sem chaves de API).

## Custos

R$0 até tração comprovada — sem infra paga (segue a postura DEC-001-034 da hub).

## KPIs operacionais

Green gates antes de qualquer claim de "Operational": `install · lint · type-check · test · build`
(AOA v3 §3.3 / DEC-001-012). Sem SLA de uptime no MVP (Cloudflare Pages já cobre alta
disponibilidade por padrão).
