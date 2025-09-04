# Blockchain Integration

## 🪙 Solana Integration Overview

### **Blockchain Strategy**
- **Primary Blockchain**: Solana (high performance, low fees)
- **Token Standard**: SPL Token (Solana Program Library)
- **Metadata Standard**: Metaplex Token Metadata
- **Storage**: Arweave (decentralized, permanent)
- **Wallets**: Phantom, Solflare, Backpack

### **Network Configuration**
```typescript
// config/solana-config.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const SOLANA_CONFIG = {
  // Mainnet configuration
  mainnet: {
    endpoint: clusterApiUrl('mainnet-beta'),
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  },
  
  // Devnet for testing
  devnet: {
    endpoint: clusterApiUrl('devnet'),
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 30000,
  },
  
  // Testnet for staging
  testnet: {
    endpoint: clusterApiUrl('testnet'),
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 30000,
  }
};

// Environment-based configuration
export const getSolanaConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return SOLANA_CONFIG.mainnet;
    case 'staging':
      return SOLANA_CONFIG.testnet;
    default:
      return SOLANA_CONFIG.devnet;
  }
};

export const connection = new Connection(getSolanaConfig().endpoint);
```

## 🏗️ Smart Contract Architecture

### **Program Structure**
```rust
// programs/engineering-forge/src/lib.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("EngForge111111111111111111111111111111111");

#[program]
pub mod engineering_forge {
    use super::*;

    // Initialize project NFT
    pub fn initialize_project_nft(
        ctx: Context<InitializeProjectNFT>,
        metadata: ProjectMetadata,
    ) -> Result<()> {
        let project_nft = &mut ctx.accounts.project_nft;
        
        project_nft.authority = ctx.accounts.authority.key();
        project_nft.metadata = metadata;
        project_nft.created_at = Clock::get()?.unix_timestamp;
        project_nft.is_active = true;
        
        Ok(())
    }

    // Mint achievement NFT
    pub fn mint_achievement_nft(
        ctx: Context<MintAchievementNFT>,
        achievement_data: AchievementData,
    ) -> Result<()> {
        let achievement_nft = &mut ctx.accounts.achievement_nft;
        
        achievement_nft.owner = ctx.accounts.owner.key();
        achievement_nft.achievement_type = achievement_data.achievement_type;
        achievement_nft.earned_at = Clock::get()?.unix_timestamp;
        achievement_nft.xp_reward = achievement_data.xp_reward;
        
        Ok(())
    }

    // Transfer project ownership
    pub fn transfer_project_ownership(
        ctx: Context<TransferOwnership>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let project_nft = &mut ctx.accounts.project_nft;
        
        require!(
            project_nft.authority == ctx.accounts.authority.key(),
            EngineeringForgeError::Unauthorized
        );
        
        project_nft.authority = new_owner;
        
        Ok(())
    }

    // Update project metadata
    pub fn update_project_metadata(
        ctx: Context<UpdateMetadata>,
        new_metadata: ProjectMetadata,
    ) -> Result<()> {
        let project_nft = &mut ctx.accounts.project_nft;
        
        require!(
            project_nft.authority == ctx.accounts.authority.key(),
            EngineeringForgeError::Unauthorized
        );
        
        project_nft.metadata = new_metadata;
        project_nft.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}

// Account structures
#[account]
pub struct ProjectNFT {
    pub authority: Pubkey,
    pub metadata: ProjectMetadata,
    pub created_at: i64,
    pub updated_at: i64,
    pub is_active: bool,
}

#[account]
pub struct AchievementNFT {
    pub owner: Pubkey,
    pub achievement_type: String,
    pub earned_at: i64,
    pub xp_reward: u64,
}

// Data structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProjectMetadata {
    pub title: String,
    pub description: String,
    pub project_type: String,
    pub components: Vec<ComponentData>,
    pub performance_metrics: PerformanceMetrics,
    pub academic_level: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ComponentData {
    pub component_type: String,
    pub properties: Vec<Property>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Property {
    pub name: String,
    pub value: String,
    pub unit: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PerformanceMetrics {
    pub acceleration: f64,
    pub top_speed: f64,
    pub efficiency: f64,
    pub handling: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AchievementData {
    pub achievement_type: String,
    pub xp_reward: u64,
}

// Context structures
#[derive(Accounts)]
pub struct InitializeProjectNFT<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProjectNFT::INIT_SPACE
    )]
    pub project_nft: Account<'info, ProjectNFT>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintAchievementNFT<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AchievementNFT::INIT_SPACE
    )]
    pub achievement_nft: Account<'info, AchievementNFT>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub project_nft: Account<'info, ProjectNFT>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub project_nft: Account<'info, ProjectNFT>,
    
    pub authority: Signer<'info>,
}

// Error definitions
#[error_code]
pub enum EngineeringForgeError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid metadata")]
    InvalidMetadata,
    #[msg("Project not found")]
    ProjectNotFound,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
```

## 🎨 NFT Metadata System

### **Metaplex Token Metadata**
```typescript
// services/metaplex-service.ts
import { 
  Metaplex, 
  keypairIdentity, 
  bundlrStorage,
  toMetaplexFile,
  findMetadataPda,
  CreateMetadataAccountV3Input
} from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';

export class MetaplexService {
  private metaplex: Metaplex;
  
  constructor(connection: Connection, wallet: Keypair) {
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: connection.rpcEndpoint,
        timeout: 60000,
      }));
  }

  // Create project NFT metadata
  async createProjectMetadata(projectData: ProjectData): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata({
      name: projectData.title,
      symbol: 'ENGFORGE',
      description: projectData.description,
      image: await this.uploadProjectImage(projectData.image),
      attributes: this.buildProjectAttributes(projectData),
      properties: {
        files: [
          {
            type: 'image/png',
            uri: await this.uploadProjectImage(projectData.image),
          },
        ],
        category: 'image',
        creators: [
          {
            address: projectData.creatorAddress,
            share: 100,
            verified: true,
          },
        ],
      },
    });

    return uri;
  }

  // Create achievement NFT metadata
  async createAchievementMetadata(achievementData: AchievementData): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata({
      name: achievementData.title,
      symbol: 'ACHIEVE',
      description: achievementData.description,
      image: await this.uploadAchievementImage(achievementData.iconUrl),
      attributes: this.buildAchievementAttributes(achievementData),
      properties: {
        files: [
          {
            type: 'image/png',
            uri: await this.uploadAchievementImage(achievementData.iconUrl),
          },
        ],
        category: 'image',
        creators: [
          {
            address: achievementData.creatorAddress,
            share: 100,
            verified: true,
          },
        ],
      },
    });

    return uri;
  }

  // Build project attributes
  private buildProjectAttributes(projectData: ProjectData) {
    return [
      {
        trait_type: 'Project Type',
        value: projectData.projectType,
      },
      {
        trait_type: 'Academic Level',
        value: projectData.academicLevel,
      },
      {
        trait_type: 'Acceleration',
        value: projectData.performanceMetrics.acceleration.toString(),
        display_type: 'number',
      },
      {
        trait_type: 'Top Speed',
        value: projectData.performanceMetrics.topSpeed.toString(),
        display_type: 'number',
      },
      {
        trait_type: 'Efficiency',
        value: `${projectData.performanceMetrics.efficiency}%`,
        display_type: 'percentage',
      },
      {
        trait_type: 'Components',
        value: projectData.components.length.toString(),
        display_type: 'number',
      },
      {
        trait_type: 'Created At',
        value: new Date().toISOString(),
        display_type: 'date',
      },
    ];
  }

  // Build achievement attributes
  private buildAchievementAttributes(achievementData: AchievementData) {
    return [
      {
        trait_type: 'Achievement Type',
        value: achievementData.achievementType,
      },
      {
        trait_type: 'XP Reward',
        value: achievementData.xpReward.toString(),
        display_type: 'number',
      },
      {
        trait_type: 'Rarity',
        value: achievementData.rarity,
      },
      {
        trait_type: 'Earned At',
        value: new Date().toISOString(),
        display_type: 'date',
      },
    ];
  }

  // Upload project image to Arweave
  private async uploadProjectImage(imageBuffer: Buffer): Promise<string> {
    const file = toMetaplexFile(imageBuffer, 'project-image.png');
    const [imageUri] = await this.metaplex.storage().upload([file]);
    return imageUri;
  }

  // Upload achievement image to Arweave
  private async uploadAchievementImage(imageBuffer: Buffer): Promise<string> {
    const file = toMetaplexFile(imageBuffer, 'achievement-icon.png');
    const [imageUri] = await this.metaplex.storage().upload([file]);
    return imageUri;
  }
}
```

## 🔗 Wallet Integration

### **Wallet Connection Service**
```typescript
// services/wallet-service.ts
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { PhantomProvider, SolflareProvider } from '@solana/wallet-adapter-wallets';

export class WalletService {
  private connection: Connection;
  private provider: PhantomProvider | SolflareProvider | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Connect to wallet
  async connectWallet(walletType: 'phantom' | 'solflare'): Promise<PublicKey> {
    try {
      if (walletType === 'phantom') {
        this.provider = window.phantom?.solana;
      } else if (walletType === 'solflare') {
        this.provider = window.solflare;
      }

      if (!this.provider) {
        throw new Error(`${walletType} wallet not found`);
      }

      // Connect to wallet
      const response = await this.provider.connect();
      return response.publicKey;

    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }

  // Sign and send transaction
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.provider.publicKey;

      // Sign transaction
      const signedTransaction = await this.provider.signTransaction(transaction);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;

    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Sign message for authentication
  async signMessage(message: string): Promise<{ signature: string; publicKey: string }> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await this.provider.signMessage(encodedMessage, 'utf8');

      return {
        signature: Buffer.from(signedMessage.signature).toString('base64'),
        publicKey: this.provider.publicKey.toString(),
      };

    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  // Get NFT tokens owned by wallet
  async getNFTs(publicKey: PublicKey): Promise<any[]> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));

    } catch (error) {
      console.error('Failed to get NFTs:', error);
      throw error;
    }
  }
}
```

## 🏭 NFT Minting Service

### **Project NFT Minting**
```typescript
// services/nft-minting-service.ts
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { 
  createMint,
  createAccount,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { MetaplexService } from './metaplex-service';
import { WalletService } from './wallet-service';

export class NFTMintingService {
  private connection: Connection;
  private metaplexService: MetaplexService;
  private walletService: WalletService;

  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.metaplexService = new MetaplexService(connection, wallet);
    this.walletService = new WalletService(connection);
  }

  // Mint project NFT
  async mintProjectNFT(projectData: ProjectData): Promise<MintResult> {
    try {
      // Create metadata URI
      const metadataUri = await this.metaplexService.createProjectMetadata(projectData);

      // Create mint account
      const mint = await createMint(
        this.connection,
        projectData.creatorKeypair,
        projectData.creatorKeypair.publicKey,
        null,
        0,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        projectData.creatorKeypair,
        mint,
        projectData.creatorKeypair.publicKey
      );

      // Mint 1 token
      await mintTo(
        this.connection,
        projectData.creatorKeypair,
        mint,
        tokenAccount.address,
        projectData.creatorKeypair,
        1
      );

      // Create metadata account
      const metadataAccount = findMetadataPda(mint);
      
      const createMetadataTx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAccount,
            mint: mint,
            mintAuthority: projectData.creatorKeypair.publicKey,
            payer: projectData.creatorKeypair.publicKey,
            updateAuthority: projectData.creatorKeypair.publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: projectData.title,
                symbol: 'ENGFORGE',
                uri: metadataUri,
                sellerFeeBasisPoints: 500, // 5%
                creators: [
                  {
                    address: projectData.creatorKeypair.publicKey,
                    verified: true,
                    share: 100,
                  },
                ],
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );

      // Sign and send metadata transaction
      const metadataSignature = await this.walletService.signAndSendTransaction(createMetadataTx);

      return {
        mint: mint.toString(),
        tokenAccount: tokenAccount.address.toString(),
        metadataAccount: metadataAccount.toString(),
        metadataUri,
        signature: metadataSignature,
      };

    } catch (error) {
      console.error('Project NFT minting failed:', error);
      throw error;
    }
  }

  // Mint achievement NFT
  async mintAchievementNFT(achievementData: AchievementData): Promise<MintResult> {
    try {
      // Create metadata URI
      const metadataUri = await this.metaplexService.createAchievementMetadata(achievementData);

      // Create mint account
      const mint = await createMint(
        this.connection,
        achievementData.ownerKeypair,
        achievementData.ownerKeypair.publicKey,
        null,
        0,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        achievementData.ownerKeypair,
        mint,
        achievementData.ownerKeypair.publicKey
      );

      // Mint 1 token
      await mintTo(
        this.connection,
        achievementData.ownerKeypair,
        mint,
        tokenAccount.address,
        achievementData.ownerKeypair,
        1
      );

      // Create metadata account
      const metadataAccount = findMetadataPda(mint);
      
      const createMetadataTx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAccount,
            mint: mint,
            mintAuthority: achievementData.ownerKeypair.publicKey,
            payer: achievementData.ownerKeypair.publicKey,
            updateAuthority: achievementData.ownerKeypair.publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: achievementData.title,
                symbol: 'ACHIEVE',
                uri: metadataUri,
                sellerFeeBasisPoints: 0, // No royalties for achievements
                creators: [
                  {
                    address: achievementData.ownerKeypair.publicKey,
                    verified: true,
                    share: 100,
                  },
                ],
                collection: null,
                uses: null,
              },
              isMutable: false, // Achievements are immutable
              collectionDetails: null,
            },
          }
        )
      );

      // Sign and send metadata transaction
      const metadataSignature = await this.walletService.signAndSendTransaction(createMetadataTx);

      return {
        mint: mint.toString(),
        tokenAccount: tokenAccount.address.toString(),
        metadataAccount: metadataAccount.toString(),
        metadataUri,
        signature: metadataSignature,
      };

    } catch (error) {
      console.error('Achievement NFT minting failed:', error);
      throw error;
    }
  }

  // Transfer NFT ownership
  async transferNFT(
    mint: PublicKey,
    fromOwner: Keypair,
    toOwner: PublicKey
  ): Promise<string> {
    try {
      // Get source token account
      const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromOwner,
        mint,
        fromOwner.publicKey
      );

      // Get destination token account
      const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromOwner,
        mint,
        toOwner
      );

      // Transfer token
      const transferSignature = await transfer(
        this.connection,
        fromOwner,
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        fromOwner,
        1
      );

      return transferSignature;

    } catch (error) {
      console.error('NFT transfer failed:', error);
      throw error;
    }
  }
}

interface MintResult {
  mint: string;
  tokenAccount: string;
  metadataAccount: string;
  metadataUri: string;
  signature: string;
}
```

## 🔍 NFT Query Service

### **NFT Data Retrieval**
```typescript
// services/nft-query-service.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export class NFTQueryService {
  private connection: Connection;
  private metaplex: Metaplex;

  constructor(connection: Connection) {
    this.connection = connection;
    this.metaplex = Metaplex.make(connection);
  }

  // Get NFT metadata
  async getNFTMetadata(mintAddress: string): Promise<any> {
    try {
      const mint = new PublicKey(mintAddress);
      const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });
      
      return {
        mint: nft.address.toString(),
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
        creators: nft.creators,
        collection: nft.collection,
        uses: nft.uses,
        isMutable: nft.isMutable,
        primarySaleHappened: nft.primarySaleHappened,
        updateAuthority: nft.updateAuthority.toString(),
        mintAuthority: nft.mintAuthority?.toString(),
        tokenStandard: nft.tokenStandard,
        collectionDetails: nft.collectionDetails,
        supply: nft.supply.basisPoints.toNumber(),
        decimals: nft.supply.basisPoints.toNumber(),
      };

    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      throw error;
    }
  }

  // Get user's NFTs
  async getUserNFTs(walletAddress: string): Promise<any[]> {
    try {
      const wallet = new PublicKey(walletAddress);
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner: wallet });

      return nfts.map(nft => ({
        mint: nft.address.toString(),
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
        creators: nft.creators,
        collection: nft.collection,
        uses: nft.uses,
        isMutable: nft.isMutable,
        primarySaleHappened: nft.primarySaleHappened,
        updateAuthority: nft.updateAuthority.toString(),
        mintAuthority: nft.mintAuthority?.toString(),
        tokenStandard: nft.tokenStandard,
        collectionDetails: nft.collectionDetails,
        supply: nft.supply.basisPoints.toNumber(),
        decimals: nft.supply.basisPoints.toNumber(),
      }));

    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      throw error;
    }
  }

  // Get NFT metadata from URI
  async getNFTMetadataFromURI(uri: string): Promise<any> {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      
      return metadata;

    } catch (error) {
      console.error('Failed to get NFT metadata from URI:', error);
      throw error;
    }
  }

  // Search NFTs by collection
  async searchNFTsByCollection(collectionAddress: string): Promise<any[]> {
    try {
      const collection = new PublicKey(collectionAddress);
      const nfts = await this.metaplex.nfts().findAllByCreator({ creator: collection });

      return nfts.map(nft => ({
        mint: nft.address.toString(),
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
        creators: nft.creators,
        collection: nft.collection,
        uses: nft.uses,
        isMutable: nft.isMutable,
        primarySaleHappened: nft.primarySaleHappened,
        updateAuthority: nft.updateAuthority.toString(),
        mintAuthority: nft.mintAuthority?.toString(),
        tokenStandard: nft.tokenStandard,
        collectionDetails: nft.collectionDetails,
        supply: nft.supply.basisPoints.toNumber(),
        decimals: nft.supply.basisPoints.toNumber(),
      }));

    } catch (error) {
      console.error('Failed to search NFTs by collection:', error);
      throw error;
    }
  }

  // Get NFT transaction history
  async getNFTTransactionHistory(mintAddress: string): Promise<any[]> {
    try {
      const mint = new PublicKey(mintAddress);
      const signatures = await this.connection.getSignaturesForAddress(mint, {
        limit: 20,
      });

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            transaction: tx,
          };
        })
      );

      return transactions;

    } catch (error) {
      console.error('Failed to get NFT transaction history:', error);
      throw error;
    }
  }
}
```

## 🔐 Security & Validation

### **Transaction Validation**
```typescript
// services/transaction-validation.ts
import { Connection, Transaction, PublicKey } from '@solana/web3.js';

export class TransactionValidationService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Validate transaction before sending
  async validateTransaction(transaction: Transaction): Promise<ValidationResult> {
    try {
      // Check transaction size
      const serializedTx = transaction.serialize({ requireAllSignatures: false });
      if (serializedTx.length > 1232) {
        return {
          isValid: false,
          error: 'Transaction too large',
          details: `Size: ${serializedTx.length} bytes (max: 1232)`,
        };
      }

      // Check account limits
      const accountKeys = transaction.message.accountKeys;
      if (accountKeys.length > 64) {
        return {
          isValid: false,
          error: 'Too many accounts',
          details: `Accounts: ${accountKeys.length} (max: 64)`,
        };
      }

      // Check instruction limits
      const instructions = transaction.message.instructions;
      if (instructions.length > 32) {
        return {
          isValid: false,
          error: 'Too many instructions',
          details: `Instructions: ${instructions.length} (max: 32)`,
        };
      }

      // Simulate transaction
      const simulation = await this.connection.simulateTransaction(transaction);
      
      if (simulation.value.err) {
        return {
          isValid: false,
          error: 'Transaction simulation failed',
          details: simulation.value.err,
        };
      }

      return {
        isValid: true,
        error: null,
        details: 'Transaction is valid',
        simulation: simulation.value,
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Validation failed',
        details: error.message,
      };
    }
  }

  // Validate wallet signature
  async validateWalletSignature(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const pubKey = new PublicKey(publicKey);
      const sigBytes = Buffer.from(signature, 'base64');
      const messageBytes = new TextEncoder().encode(message);

      return nacl.sign.detached.verify(
        messageBytes,
        sigBytes,
        pubKey.toBytes()
      );

    } catch (error) {
      console.error('Signature validation failed:', error);
      return false;
    }
  }

  // Check account ownership
  async validateAccountOwnership(
    accountAddress: string,
    expectedOwner: string
  ): Promise<boolean> {
    try {
      const account = new PublicKey(accountAddress);
      const owner = new PublicKey(expectedOwner);

      const accountInfo = await this.connection.getAccountInfo(account);
      
      if (!accountInfo) {
        return false;
      }

      return accountInfo.owner.equals(owner);

    } catch (error) {
      console.error('Account ownership validation failed:', error);
      return false;
    }
  }
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
  details: any;
  simulation?: any;
}
```

## 📊 Analytics & Tracking

### **Blockchain Analytics**
```typescript
// services/blockchain-analytics.ts
import { Connection, PublicKey } from '@solana/web3.js';

export class BlockchainAnalyticsService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Track NFT minting events
  async trackNFTMinting(mintData: MintTrackingData): Promise<void> {
    try {
      // Store minting event in database
      await this.storeMintingEvent({
        mintAddress: mintData.mint,
        creatorAddress: mintData.creator,
        projectType: mintData.projectType,
        academicLevel: mintData.academicLevel,
        timestamp: new Date(),
        network: this.connection.rpcEndpoint,
        transactionHash: mintData.signature,
      });

      // Track analytics metrics
      await this.updateMintingMetrics(mintData.projectType, mintData.academicLevel);

    } catch (error) {
      console.error('Failed to track NFT minting:', error);
    }
  }

  // Get minting statistics
  async getMintingStats(timeframe: 'day' | 'week' | 'month'): Promise<MintingStats> {
    try {
      const stats = await this.getMintingStatsFromDB(timeframe);
      
      return {
        totalMints: stats.totalMints,
        uniqueCreators: stats.uniqueCreators,
        projectTypeDistribution: stats.projectTypeDistribution,
        academicLevelDistribution: stats.academicLevelDistribution,
        averageGasFees: stats.averageGasFees,
        timeframe,
      };

    } catch (error) {
      console.error('Failed to get minting stats:', error);
      throw error;
    }
  }

  // Track NFT transfers
  async trackNFTTransfer(transferData: TransferTrackingData): Promise<void> {
    try {
      // Store transfer event
      await this.storeTransferEvent({
        mintAddress: transferData.mint,
        fromAddress: transferData.from,
        toAddress: transferData.to,
        timestamp: new Date(),
        transactionHash: transferData.signature,
        network: this.connection.rpcEndpoint,
      });

      // Update transfer metrics
      await this.updateTransferMetrics();

    } catch (error) {
      console.error('Failed to track NFT transfer:', error);
    }
  }

  // Get user activity
  async getUserActivity(walletAddress: string): Promise<UserActivity> {
    try {
      const wallet = new PublicKey(walletAddress);
      
      // Get recent transactions
      const signatures = await this.connection.getSignaturesForAddress(wallet, {
        limit: 50,
      });

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            transaction: tx,
          };
        })
      );

      return {
        walletAddress,
        totalTransactions: signatures.length,
        recentTransactions: transactions,
        lastActivity: signatures[0]?.blockTime,
      };

    } catch (error) {
      console.error('Failed to get user activity:', error);
      throw error;
    }
  }

  // Monitor network performance
  async getNetworkPerformance(): Promise<NetworkPerformance> {
    try {
      const performance = await this.connection.getPerformanceSamples(10);
      
      return {
        averageSlotTime: performance.reduce((acc, sample) => acc + sample.numTransactions, 0) / performance.length,
        totalTransactions: performance.reduce((acc, sample) => acc + sample.numTransactions, 0),
        averageBlockTime: performance.reduce((acc, sample) => acc + sample.slotTime, 0) / performance.length,
        samples: performance.length,
      };

    } catch (error) {
      console.error('Failed to get network performance:', error);
      throw error;
    }
  }
}

interface MintTrackingData {
  mint: string;
  creator: string;
  projectType: string;
  academicLevel: string;
  signature: string;
}

interface TransferTrackingData {
  mint: string;
  from: string;
  to: string;
  signature: string;
}

interface MintingStats {
  totalMints: number;
  uniqueCreators: number;
  projectTypeDistribution: Record<string, number>;
  academicLevelDistribution: Record<string, number>;
  averageGasFees: number;
  timeframe: string;
}

interface UserActivity {
  walletAddress: string;
  totalTransactions: number;
  recentTransactions: any[];
  lastActivity: number | null;
}

interface NetworkPerformance {
  averageSlotTime: number;
  totalTransactions: number;
  averageBlockTime: number;
  samples: number;
}
```
