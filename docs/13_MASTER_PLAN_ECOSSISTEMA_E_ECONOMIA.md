---
idea: IDEA-010
doc: 13_MASTER_PLAN_ECOSSISTEMA_E_ECONOMIA
version: 0.2.0
standard: GUILD-DOC-STANDARD@0.2.0
status: proposed
updated: 2026-11-14
conforme: {guild_master_plan: 2.0.0-proposta.2, guild_plan_standard: 0.2.0}
---

# Master Plan: a Forja no ecossistema da Guild

> **Em uma frase.** Liga a Forja à identidade e à economia comuns da Guild, sem mudar o que a Forja
> é: um jogo em que a física decide. Este plano se soma aos documentos 07 a 12 e não substitui nenhum.
>
> `SEM VALOR REAL ATÉ O PORTÃO N3` (DEC-001-026 da Guild).

## 1. Como este plano conversa com os que já existem

| Documento | O que já define | O que este plano acrescenta |
|---|---|---|
| 01_VISION, DEC-010-004 | MVP sem conta, sem servidor, sem blockchain | Continua valendo: a ligação com a economia é opcional para o jogador e começa em pontos |
| 09 (CAD e NFT) | Certificado de homologação como NFT, já implementado na interface | Enquadra a cunhagem na escada N0 a N3: até o portão, só rede de teste |
| 10 (frontend e economia da Forja) | Créditos, sucata, pontos de P&D, XP de engenheiro | Diz qual desses recursos fica só na Forja e qual circula na Guild |
| 11 (backend e sincronização) | Local primeiro, borda, turmas, antitrapaça | A conta passa a ser o Guild ID; os eventos econômicos seguem o contrato da economia |
| 12 (rastreador de tarefas) | Ondas 0 a 6 | Acrescenta a Onda 7 abaixo |

Há uma contradição aparente a registrar: a visão diz "sem blockchain nesta fase" e o documento 09
já entregou interface de carteira e cunhagem. A escada resolve: o que existe hoje é nível N2 no
máximo (rede de teste, sem valor), e a visão continua correta para o jogador comum, que joga em N0.
Proponho uma decisão DEC-010 que diga isso com todas as letras.

## 2. O que circula e o que fica

| Recurso da Forja | Destino | Motivo |
|---|---|---|
| XP de engenheiro | Vira XP local; uma parte alimenta o XP global do Guild ID | Progresso do jogador vale em toda a Guild |
| Créditos da Forja | Moeda interna da Forja, no razão central (N1), com orçamento de emissão | É a candidata a token do projeto, se um dia merecer |
| Sucata de aço, pontos de P&D | Ficam só na Forja | São recursos de mecânica de jogo, não moeda |
| Selos e estrelas | Selos do Guild ID | Dão acesso em outros produtos |
| Projeto homologado (ponte, circuito, veículo) | Item no contrato de itens, com histórico e direito de cunhagem a partir de um nível | É o "Proof of Engineering" do documento 09 |

Recompensas que a Forja passa a poder dar: pontos de memecoin em missões e sequências de presença;
ENG para quem liga a mineração opcional; itens e acessos de outros projetos (por exemplo, um
artefato no Heroes por concluir um pacote de níveis); acesso a áreas reservadas, comunidades e
informação antecipada por selo.

Regra da Forja que não muda: **nenhuma recompensa compra aprovação da física.** Moeda e item
compram cosmético, conveniência e acesso; nunca fazem uma ponte fraca passar.

## 3. Perfil de aprendizado

A Forja já mede muito: quantas tentativas, que erro conceitual se repete (o Modo Educador detecta
flambagem, curto-circuito, estol), quanto custou a solução. Isso é matéria-prima direta para o
perfil de aprendizado do Guild ID nos domínios espaço, números e lógica. O envio é opcional, com
consentimento, e para turmas de escola segue a regra de menores definida no plano do perfil.

## 4. Arquitetura da ligação

```
 Forja (cliente, local primeiro)
   ├─ joga sem conta ─────────────────────────► tudo local, como hoje
   └─ com Guild ID
        ├─ adaptador de identidade   (contrato de identidade)
        ├─ fila de eventos econômicos (contrato de eventos; envia quando há rede; idempotente)
        ├─ inventário de projetos    (contrato de itens)
        ├─ minerador opcional        (biblioteca do ENG; fora da versão de loja)
        └─ perfil                    (envio opcional de medidas)
```

A fila de eventos respeita o princípio do documento 11: o jogo nunca espera o servidor. O crédito
aparece como "a confirmar" até o razão responder. A validação que importa (a solução passa mesmo na
física?) é a reexecução determinística do módulo B3, e o razão só credita evento validado.

## 5. Onda 7 — Fase 13: a Forja no ecossistema

A fonte das tarefas é `plano/TAREFAS.yaml` (17 tarefas, sigla FRG, esquema `guild-plano/2`), com a
instrução, a verificação e as dependências de cada uma. O quadro em `plano/QUADRO.md` é gerado. Ao
adotar, o rastreador do documento 12 ganha uma linha por lote apontando para lá.

| Lote | Nome | Tarefas | Depende de fora |
|---|---|---|---|
| 13.1 | Alinhamento documental | FRG-13.1-01 a 13.1-05 | — |
| 13.2 | Identidade e eventos | FRG-13.2-01 a 13.2-04 | Contratos de identidade e de eventos; conformidade e biblioteca cliente da economia |
| 13.3 | Itens, missões e acessos | FRG-13.3-01 a 13.3-04 | Contrato de itens; serviço de missões |
| 13.4 | Mineração opcional e perfil | FRG-13.4-01, 13.4-02 | Biblioteca do ENG; serviço de perfil; decisão D-18 |
| 13.5 | Cunhagem em rede de teste | FRG-13.5-01, 13.5-02 | Carteira embutida |

Oito das dezessete podem começar agora, sem esperar ninguém: as cinco do lote 13.1, a fila de
eventos (13.2-02), o adaptador de identidade (13.2-01) e o projeto homologado como item (13.3-01),
estas três sobre os rascunhos de contrato já entregues.

A peça nova mais importante é o **validador na borda** (FRG-13.2-03): a Forja roda inteira no
navegador, e um navegador não pode ser quem manda o razão creditar. O validador reexecuta a
simulação de física de forma determinística, confere que a solução passa e só então assina o
evento. É o módulo B3 do documento 11, que passa a ser condição da ligação com a economia.

## 6. Portões

| Portão | Exige |
|---|---|
| Ligar ao razão | Testes de conformidade da economia e orçamento de emissão aprovado (ECO-2.1-03) |
| Qualquer recompensa nova | Passar na regra "não compra aprovação da física" |
| Perfil em turmas | Texto de consentimento e regra de menores aprovados |
| Cunhagem com valor real | Portão N3 da Guild |

## 7. Riscos

| Risco | Tratamento |
|---|---|
| A economia desviar o jogo do aprendizado | Regra da seção 2; recompensa atrelada a solução validada pela física |
| Trapaça para colher crédito | Reexecução determinística antes do crédito |
| Dado de aluno menor de idade | Envio desligado por padrão em turmas |
| Repositório público expor regra em estudo | Parâmetros da economia moram no repositório privado da economia; aqui só o que já foi decidido |
