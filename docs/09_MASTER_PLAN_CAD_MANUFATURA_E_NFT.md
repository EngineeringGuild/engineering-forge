---
idea: IDEA-010
doc: 09_MASTER_PLAN_CAD_MANUFATURA_E_NFT
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan: Exportador CAD/Manufatura Real & Digital Twin NFT
### The Physical-to-Digital Forge & Web3 Engineering Registry
**Conectando Simulação Física no Navegador à Fabricação Real e Registro Imutável de Veículos**

---

## 1. Visão Arquitetural: Da Tela para o Mundo Físico e Blockchain

O objetivo do módulo **CAD & Web3 Digital Twin** é fechar o elo entre três mundos:
1. **O Mundo Virtual (Engineering Forge):** Onde o jogador projeta, ajusta e simula sob solver numérico de rigidez direta e cinemática newtoniana.
2. **O Mundo Físico (Manufatura Digital):** Onde o artefato virtual se materializa como uma ponte ou chassi real via impressoras 3D FDM/SLA e corte a laser CNC.
3. **O Mundo Digital Imutável (Web3 NFT):** Onde os dados certificados de engenharia (peso, velocidade, eficiência energética, fator de segurança) são cunhados on-chain como um ativo único com rastreabilidade criptográfica.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ENGINEERING FORGE CLIENT                        │
│   Canvas 2D / Solvers de Física / Validação de Restrições Técnicas     │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│     PIPELINE CAD/CAM DE FABRICAÇÃO   │ │ DIGITAL TWIN WEB3 MINT ENGINE │
│  - Exportador .STL paramétrico 3D    │ │ - Certificado de Homologação  │
│  - Juntas customizadas (Snap/Socket) │ │ - Metadados On-Chain (ERC721) │
│  - Exportador .DXF/.SVG corte laser  │ │ - Hash SHA-256 de Blueprint   │
│  - Tolerâncias DIN/ISO 2768-m        │ │ - Proof-of-Engineering Gate   │
└───────────────────┬──────────────────┘ └───────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
       FabLab / Impressora 3D                  Solana / Polygon / EVM
       MDF / Acrílico / FDM                    NFT Veicular Homologado
```

---

## 2. Parte A — Pipeline de Manufatura Digital (CAD/CAM no Cliente)

### 2.1 Geração Paramétrica de Nós para Impressão 3D (`.STL`)
Em uma treliça real, os membros retos (madeira, acrílico ou tubos de alumínio) conectam-se em **nós com geometria customizada**.
- **Algoritmo de Geração de Malha de Juntas:**
  - Para cada nó no plano $(x, y)$, o motor identifica todos os membros incidentes e calcula seus ângulos polares $\theta_k = \text{atan2}(\Delta y_k, \Delta x_k)$.
  - O gerador triangula uma geometria tridimensional no cliente (via Three.js BufferGeometry ou gerador de STL binário puro):
    - **Modo Encaixe Tubular (Socket Connector):** Cilindros ocos orientados ao longo do vetor de cada membro com diâmetro interno ajustável ($D_{\text{int}} = D_{\text{haste}} + \text{Folga}$).
    - **Modo Parafusado (Gusset Plate):** Chapas duplas com furos passantes para parafusos métricos standard M3 ou M4 (norma DIN 912).
- **Compensação de Tolerância de Fabricação:**
  - Slider de tolerância dimensional para compensar encolhimento térmico de filamento (PLA/ABS/PETG): ajuste de folga de $0.15\text{mm}$ a $0.40\text{mm}$ conforme calibração da impressora.

### 2.2 Exportador Vetorial 1:1 para Corte a Laser (`.DXF` e `.SVG`)
- **Planificação de Barras e Vigas:**
  - Extrai o comprimento nominal de cada barra $L_i = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} - 2 \cdot R_{\text{socket}}$.
  - Geração de layout em chapa plana (*Nesting 2D*) para minimizar desperdício de material em chapas padrão de MDF/Acrílico ($300\text{mm} \times 200\text{mm}$ ou $600\text{mm} \times 400\text{mm}$).
  - Linhas vermelhas (RGB #FF0000) com espessura de corte *hairline* ($0.01\text{mm}$) para corte vetorial e linhas pretas para gravação de identificadores (ex: `B-01`, `C-04`).

---

## 3. Parte B — Web3 Vehicle & Artifact NFT Minting Engine

### 3.1 O Conceito: "Proof of Engineering" (Prova de Engenharia)
Diferente de NFTs puramente cosméticos ou gerados aleatoriamente, o **NFT da Forja** é um **Digital Twin Técnico**:
- **Regra de Homologação Estrita:** Um artefato (veículo ou ponte) **SÓ PODE SER MINTADO** se tiver sido executado e aprovado com sucesso na simulação de física nominal do jogo.
- O contrato inteligente ou a API de oráculo de minting exige a assinatura criptográfica do motor de simulação comprovando que os critérios foram atingidos sem trapaça.

### 3.2 Estrutura de Metadados On-Chain (ERC-721 / Metaplex Token Standard)
```json
{
  "name": "Forge Interceptor - Chassis Mk.IV",
  "symbol": "FORGE",
  "description": "Certificado Técnico de Homologação emitido pela Engineering Guild. Artefato testado e validado fisicamente no motor da Forja.",
  "image": "https://arweave.net/vector_render_svg_hash.svg",
  "animation_url": "https://arweave.net/interactive_model_3d.glb",
  "external_url": "https://forge.guildeng.com/inspect/0x4a7b...",
  "attributes": [
    { "trait_type": "Discipline", "value": "Machines & Vehicles" },
    { "trait_type": "Chassis Type", "value": "Light Carbon Monocoque" },
    { "trait_type": "Powertrain", "value": "Twin-Brushless DC Electric" },
    { "trait_type": "Max Measured Speed", "value": "39.6 m/s (142.5 km/h)", "display_type": "number" },
    { "trait_type": "Vehicle Mass", "value": 850, "display_type": "number", "max_value": 3000 },
    { "trait_type": "Traction Friction Peak (mu)", "value": 0.85, "display_type": "number" },
    { "trait_type": "Energy Efficiency (J/m)", "value": 112.4, "display_type": "number" },
    { "trait_type": "Safety Margin Factor", "value": 2.14, "display_type": "number" },
    { "trait_type": "Homologation Grade", "value": "S-Tier Certified" },
    { "trait_type": "Blueprint SHA256", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
  ],
  "properties": {
    "category": "engineering_artifact",
    "files": [
      { "uri": "https://arweave.net/blueprint_source.json", "type": "application/json" },
      { "uri": "https://arweave.net/manufacture_cut_sheet.dxf", "type": "application/dxf" }
    ],
    "creators": [
      { "address": "GuildEngineeringTreasuryAddress", "share": 10 },
      { "address": "EngineerPlayerWalletAddress", "share": 90 }
    ]
  }
}
```

### 3.3 Economia de Token & Reputação do Engenheiro (Guild Tokenomics)
1. **Patente & Royalties de Blueprint:**
   - Se um jogador criar um blueprint de chassi com eficiência aerodinâmica e de massa recorde, outros jogadores podem "licenciar" seu blueprint na Forja para disputar ligas semanais, pagando royalties automáticos ao criador.
2. **Níveis de Certificação da Federação da Forja:**
   - **Classe D (Apprentice):** Modelos básicos que apenas cumprem o requisito mínimo.
   - **Classe C / B (Journeyman / Senior):** Projetos com otimização de custo ($< 70\%$ do orçamento máximo) e fator de segurança $SF \ge 1.5$.
   - **Classe A / S-Tier (Master Engineer):** Projetos na fronteira de Pareto com certificação de manufatura real e dados prontos para fabricação física.

---

## 4. Fases de Execução do Plano de Manufatura & NFT

| Fase | Título | Entregáveis Técnicos |
|---|---|---|
| **M1** | Motor STL Paramétrico | Gerador no browser de conectores 3D com malha binária `.stl` e folga de impressão ajustável. |
| **M2** | Exportador Laser DXF/SVG | Planificador de vigas e peças 2D com nesting em prancha de fabricação e cotas milimétricas. |
| **M3** | Proof-of-Engineering Oráculo | Assinatura local e serializador de telemetria física do veículo aprovado em simulador. |
| **M4** | Web3 Minting Interface | Conexão com carteira (Phantom / MetaMask), upload descentralizado (IPFS/Arweave) e cunhagem do Digital Twin NFT. |
