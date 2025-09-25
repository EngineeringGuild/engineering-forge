# ⛓️ Domínio Blockchain - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: ⏳ **Planejado**

---

## 🎯 **Visão Geral**

O domínio blockchain é responsável por toda a integração com a blockchain Solana, incluindo NFTs, carteiras, transações e marketplace. Ele proporciona credenciais verificáveis, propriedade digital e economia tokenizada para o Engineering Forge.

### **Responsabilidades**
- **Integração Solana**: Conexão com a blockchain Solana
- **Sistema de NFTs**: Criação e gerenciamento de NFTs
- **Gestão de Carteiras**: Conexão e gerenciamento de carteiras
- **Transações**: Processamento de transações blockchain
- **Marketplace**: Sistema de compra/venda de NFTs

### **Progresso Atual**
- **Progresso**: 5%
- **Tarefas Ativas**: 1
- **Tarefas Concluídas**: 0
- **Próxima Tarefa**: Setup do ambiente Solana

---

## 🏗️ **Arquitetura do Domínio**

### **Entidades Principais**
- **NFT**: Token não fungível
- **Wallet**: Carteira do usuário
- **Transaction**: Transação blockchain
- **Certificate**: Certificado NFT
- **Marketplace**: Marketplace de NFTs
- **Token**: Token fungível

### **Value Objects**
- **WalletAddress**: Endereço da carteira
- **TransactionHash**: Hash da transação
- **TokenAmount**: Quantidade de tokens
- **NFTMetadata**: Metadados do NFT

### **Serviços de Domínio**
- **WalletService**: Gestão de carteiras
- **NFTService**: Criação e gerenciamento de NFTs
- **TransactionService**: Processamento de transações
- **MarketplaceService**: Operações de marketplace

---

## 📋 **Entidades Detalhadas**

### **NFT (Token Não Fungível)**
```typescript
interface NFT {
  id: string;
  mintAddress: string;
  ownerAddress: string;
  creatorAddress: string;
  type: NFTType; // 'certificate' | 'component' | 'achievement' | 'project'
  metadata: NFTMetadata;
  attributes: NFTAttribute[];
  rarity: NFTRarity; // 'common' | 'rare' | 'epic' | 'legendary'
  isListed: boolean;
  listingPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Wallet (Carteira)**
```typescript
interface Wallet {
  id: string;
  userId: string;
  address: string;
  type: WalletType; // 'phantom' | 'solflare' | 'ledger' | 'mobile'
  isConnected: boolean;
  balance: number; // SOL
  nfts: NFT[];
  transactions: Transaction[];
  lastActivity: Date;
  createdAt: Date;
}
```

### **Transaction (Transação)**
```typescript
interface Transaction {
  id: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  type: TransactionType; // 'mint' | 'transfer' | 'purchase' | 'sale'
  amount: number;
  tokenType: TokenType; // 'SOL' | 'USDC' | 'ENG' | 'NFT'
  status: TransactionStatus; // 'pending' | 'confirmed' | 'failed'
  gasFee: number;
  timestamp: Date;
  blockNumber: number;
}
```

### **Certificate (Certificado)**
```typescript
interface Certificate {
  id: string;
  nftId: string;
  userId: string;
  courseId: string;
  title: string;
  description: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationUrl: string;
  metadata: CertificateMetadata;
  isVerified: boolean;
  verificationCount: number;
}
```

---

## 🎯 **Casos de Uso**

### **Connect Wallet (Conectar Carteira)**
```typescript
interface ConnectWalletUseCase {
  execute(userId: string, walletType: WalletType): Promise<WalletConnection>;
}

// Fluxo:
// 1. Solicitar conexão da carteira
// 2. Validar endereço
// 3. Verificar saldo
// 4. Criar registro no banco
// 5. Sincronizar NFTs
```

### **Mint NFT (Mintar NFT)**
```typescript
interface MintNFTUseCase {
  execute(userId: string, nftData: NFTData): Promise<Transaction>;
}

// Fluxo:
// 1. Validar dados do NFT
// 2. Criar metadados
// 3. Upload para Arweave
// 4. Executar minting
// 5. Confirmar transação
// 6. Atualizar banco de dados
```

### **Transfer NFT (Transferir NFT)**
```typescript
interface TransferNFTUseCase {
  execute(fromUserId: string, toAddress: string, nftId: string): Promise<Transaction>;
}

// Fluxo:
// 1. Validar propriedade
// 2. Verificar endereço de destino
// 3. Executar transferência
// 4. Confirmar transação
// 5. Atualizar registros
```

### **List NFT (Listar NFT)**
```typescript
interface ListNFTUseCase {
  execute(userId: string, nftId: string, price: number): Promise<Listing>;
}

// Fluxo:
// 1. Validar propriedade
// 2. Definir preço
// 3. Criar listing
// 4. Atualizar marketplace
// 5. Notificar usuários
```

---

## 🛠️ **Serviços de Domínio**

### **WalletService**
```typescript
class WalletService {
  async connectWallet(userId: string, walletType: WalletType): Promise<Wallet> {
    // Lógica de conexão de carteira
  }
  
  async disconnectWallet(userId: string): Promise<void> {
    // Lógica de desconexão
  }
  
  async getBalance(address: string): Promise<number> {
    // Obter saldo da carteira
  }
  
  async syncNFTs(address: string): Promise<NFT[]> {
    // Sincronizar NFTs da carteira
  }
}
```

### **NFTService**
```typescript
class NFTService {
  async mintNFT(userId: string, nftData: NFTData): Promise<NFT> {
    // Lógica de minting
  }
  
  async transferNFT(fromUserId: string, toAddress: string, nftId: string): Promise<Transaction> {
    // Lógica de transferência
  }
  
  async getNFTById(nftId: string): Promise<NFT> {
    // Buscar NFT por ID
  }
  
  async getNFTsByOwner(ownerAddress: string): Promise<NFT[]> {
    // Buscar NFTs por proprietário
  }
}
```

### **TransactionService**
```typescript
class TransactionService {
  async createTransaction(transactionData: TransactionData): Promise<Transaction> {
    // Criar transação
  }
  
  async confirmTransaction(hash: string): Promise<Transaction> {
    // Confirmar transação
  }
  
  async getTransactionHistory(address: string): Promise<Transaction[]> {
    // Histórico de transações
  }
  
  async estimateGasFee(transactionData: TransactionData): Promise<number> {
    // Estimar taxa de gas
  }
}
```

---

## 🔗 **Integração com Solana**

### **Smart Contracts (Programs)**
```rust
// Certificate Minting Program
use anchor_lang::prelude::*;

#[program]
pub mod engineering_forge {
    use super::*;
    
    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        project_data: ProjectData,
        metadata_uri: String,
    ) -> Result<()> {
        // Lógica de minting de certificado
    }
    
    pub fn transfer_certificate(
        ctx: Context<TransferCertificate>,
        new_owner: Pubkey,
    ) -> Result<()> {
        // Lógica de transferência
    }
}
```

### **Metadados NFT**
```json
{
  "name": "Engineering Forge Certificate",
  "description": "Certificate of completion for Mechanical Engineering Course",
  "image": "https://arweave.net/...",
  "attributes": [
    {
      "trait_type": "Course",
      "value": "Mechanical Engineering"
    },
    {
      "trait_type": "Grade",
      "value": "A+"
    },
    {
      "trait_type": "Completion Date",
      "value": "2025-01-15"
    }
  ]
}
```

---

## 🏪 **Marketplace**

### **Funcionalidades**
- **Listagem**: Listar NFTs para venda
- **Compra**: Comprar NFTs listados
- **Leilões**: Sistema de leilões
- **Ofertas**: Fazer ofertas por NFTs
- **Histórico**: Histórico de transações

### **Tipos de NFTs**
- **Certificados**: Certificados de conclusão
- **Componentes**: Componentes raros
- **Projetos**: Projetos únicos
- **Conquistas**: Conquistas especiais

---

## 💰 **Economia Tokenizada**

### **Tokens**
- **SOL**: Moeda principal da Solana
- **USDC**: Stablecoin para preços
- **ENG**: Token nativo do Engineering Forge
- **NFTs**: Ativos únicos

### **Mecânicas Econômicas**
- **Minting Fees**: Taxas de minting
- **Trading Fees**: Taxas de negociação
- **Staking Rewards**: Recompensas por staking
- **Liquidity Pools**: Pools de liquidez

---

## 🔒 **Segurança**

### **Validações**
- **Ownership Verification**: Verificação de propriedade
- **Signature Validation**: Validação de assinaturas
- **Transaction Verification**: Verificação de transações
- **Metadata Integrity**: Integridade dos metadados

### **Auditoria**
- **Smart Contract Audit**: Auditoria de contratos
- **Security Testing**: Testes de segurança
- **Penetration Testing**: Testes de penetração
- **Code Review**: Revisão de código

---

## 🧪 **Testes**

### **Testes Unitários**
```typescript
describe('NFTService', () => {
  it('should mint NFT successfully', async () => {
    // Teste de minting
  });
  
  it('should transfer NFT correctly', async () => {
    // Teste de transferência
  });
});
```

### **Testes de Integração**
```typescript
describe('Blockchain Integration', () => {
  it('should complete full NFT lifecycle', async () => {
    // Teste do ciclo completo
  });
});
```

---

## 🚀 **Roadmap**

### **V1.0 - Protótipo**
- [ ] Setup do ambiente Solana
- [ ] Conexão básica de carteiras
- [ ] Minting simples de certificados

### **V2.0 - MVP**
- [ ] Sistema completo de NFTs
- [ ] Marketplace básico
- [ ] Integração com certificados

### **V3.0 - 3D Web**
- [ ] NFTs de projetos 3D
- [ ] Marketplace avançado
- [ ] Sistema de leilões

### **V4.0 - VR**
- [ ] NFTs VR
- [ ] Marketplace VR
- [ ] Economia VR

---

## 📞 **Contatos**

### **Responsável pelo Domínio**
- **Nome**: [Blockchain Developer]
- **Email**: [email@exemplo.com]
- **Discord**: [username#1234]

### **Stakeholders**
- **Smart Contract Developer**: [Nome]
- **Security Auditor**: [Nome]
- **Economist**: [Nome]

---

*Este documento é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
