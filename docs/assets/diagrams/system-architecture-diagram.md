# System Architecture Diagram

**File Path**: `docs/assets/diagrams/system-architecture-diagram.md`  
**Document Type**: Visual Asset - System Architecture Diagram  
**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete  

---

## 🏗️ Complete System Architecture

### **High-Level System Overview**
```mermaid
graph TB
    %% User Layer
    subgraph "User Interface Layer"
        Web[Web Browser]
        Mobile[Mobile App]
        VR[VR Headset]
    end

    %% Frontend Layer
    subgraph "Frontend Services"
        UI[React UI Components]
        GameEngine[3D Game Engine]
        WebSocket[WebSocket Client]
    end

    %% Load Balancer
    LB[Load Balancer<br/>NGINX]

    %% API Gateway
    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Kong]
        Auth[Authentication<br/>JWT + MFA]
        RateLimit[Rate Limiting]
    end

    %% Microservices Layer
    subgraph "Core Microservices"
        UserService[User Service<br/>User Management]
        ForgeService[Forge Service<br/>Crafting Logic]
        GameService[Game Service<br/>Game State]
        InventoryService[Inventory Service<br/>Items & Resources]
        BlockchainService[Blockchain Service<br/>NFT & Smart Contracts]
        NotificationService[Notification Service<br/>Real-time Updates]
    end

    %% Data Layer
    subgraph "Data Storage Layer"
        PostgreSQL[(PostgreSQL<br/>Primary Database)]
        Redis[(Redis<br/>Cache & Sessions)]
        MinIO[(MinIO<br/>File Storage)]
    end

    %% External Services
    subgraph "External Integrations"
        Solana[Solana Blockchain<br/>NFT Operations]
        Email[Email Service<br/>SMTP]
        Payment[Payment Gateway<br/>Stripe]
        Analytics[Analytics Service<br/>Mixpanel]
    end

    %% Monitoring & DevOps
    subgraph "Monitoring & DevOps"
        Prometheus[Prometheus<br/>Metrics]
        Grafana[Grafana<br/>Dashboards]
        ELK[ELK Stack<br/>Logging]
        K8s[Kubernetes<br/>Orchestration]
    end

    %% Connections
    Web --> LB
    Mobile --> LB
    VR --> LB
    
    LB --> Gateway
    
    Gateway --> Auth
    Gateway --> RateLimit
    
    Auth --> UserService
    Gateway --> UserService
    Gateway --> ForgeService
    Gateway --> GameService
    Gateway --> InventoryService
    Gateway --> BlockchainService
    Gateway --> NotificationService
    
    UserService --> PostgreSQL
    ForgeService --> PostgreSQL
    GameService --> PostgreSQL
    InventoryService --> PostgreSQL
    BlockchainService --> PostgreSQL
    
    UserService --> Redis
    ForgeService --> Redis
    GameService --> Redis
    NotificationService --> Redis
    
    ForgeService --> MinIO
    InventoryService --> MinIO
    
    BlockchainService --> Solana
    UserService --> Email
    UserService --> Payment
    GameService --> Analytics
    
    UserService --> Prometheus
    ForgeService --> Prometheus
    GameService --> Prometheus
    
    Prometheus --> Grafana
    ELK --> Grafana
    
    K8s --> UserService
    K8s --> ForgeService
    K8s --> GameService
    K8s --> InventoryService
    K8s --> BlockchainService
    K8s --> NotificationService

    %% Styling
    classDef userLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef frontendLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef gatewayLayer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef serviceLayer fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef dataLayer fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalLayer fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef monitoringLayer fill:#fafafa,stroke:#424242,stroke-width:2px

    class Web,Mobile,VR userLayer
    class UI,GameEngine,WebSocket frontendLayer
    class Gateway,Auth,RateLimit gatewayLayer
    class UserService,ForgeService,GameService,InventoryService,BlockchainService,NotificationService serviceLayer
    class PostgreSQL,Redis,MinIO dataLayer
    class Solana,Email,Payment,Analytics externalLayer
    class Prometheus,Grafana,ELK,K8s monitoringLayer
```

---

## 🔄 Data Flow Architecture

### **User Authentication Flow**
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant UserS as User Service
    participant DB as Database
    participant Redis as Cache

    U->>UI: Enter credentials
    UI->>GW: POST /auth/login
    GW->>Auth: Forward request
    Auth->>UserS: Validate credentials
    UserS->>DB: Query user data
    DB-->>UserS: User data
    UserS-->>Auth: Validation result
    Auth->>Auth: Generate JWT token
    Auth->>Redis: Store session
    Auth-->>GW: JWT token
    GW-->>UI: Authentication response
    UI->>UI: Store token
    UI-->>U: Login successful
```

### **Crafting Flow**
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant ForgeS as Forge Service
    participant GameS as Game Service
    participant InvS as Inventory Service
    participant BlockS as Blockchain Service
    participant DB as Database
    participant Solana as Solana

    U->>UI: Select crafting project
    UI->>ForgeS: GET /forge/projects
    ForgeS-->>UI: Available projects
    
    U->>UI: Start crafting
    UI->>ForgeS: POST /forge/craft
    ForgeS->>InvS: Check resources
    InvS-->>ForgeS: Resource status
    
    alt Sufficient resources
        ForgeS->>GameS: Start crafting process
        GameS->>DB: Create crafting record
        GameS-->>ForgeS: Crafting started
        
        loop Crafting progress
            GameS->>UI: Update progress
            UI-->>U: Show progress
        end
        
        GameS->>InvS: Deduct resources
        GameS->>DB: Complete crafting
        GameS->>BlockS: Mint NFT
        BlockS->>Solana: Create NFT
        Solana-->>BlockS: NFT created
        BlockS-->>GameS: NFT details
        GameS-->>ForgeS: Crafting complete
        ForgeS-->>UI: Success response
        UI-->>U: Show crafted item
    else Insufficient resources
        ForgeS-->>UI: Error response
        UI-->>U: Show error message
    end
```

---

## 🗄️ Database Schema Overview

### **Core Entity Relationships**
```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string username
        string password_hash
        integer level
        integer experience
        timestamp created_at
        timestamp updated_at
    }

    FORGES {
        uuid id PK
        uuid user_id FK
        string name
        integer level
        integer temperature
        boolean is_active
        timestamp created_at
    }

    ITEMS {
        uuid id PK
        uuid user_id FK
        string type
        string quality
        jsonb stats
        jsonb metadata
        timestamp crafted_at
    }

    CRAFTING_PROJECTS {
        uuid id PK
        string name
        string description
        jsonb requirements
        jsonb rewards
        integer difficulty
        boolean is_active
    }

    USER_RESOURCES {
        uuid id PK
        uuid user_id FK
        integer gold
        integer steel
        integer iron
        integer wood
        timestamp updated_at
    }

    CRAFTING_HISTORY {
        uuid id PK
        uuid user_id FK
        uuid forge_id FK
        uuid project_id FK
        boolean success
        jsonb result
        timestamp completed_at
    }

    USERS ||--o{ FORGES : owns
    USERS ||--o{ ITEMS : crafts
    USERS ||--o{ USER_RESOURCES : has
    USERS ||--o{ CRAFTING_HISTORY : performs
    FORGES ||--o{ CRAFTING_HISTORY : used_in
    CRAFTING_PROJECTS ||--o{ CRAFTING_HISTORY : completed
```

---

## 🌐 Network Architecture

### **Service Communication Pattern**
```mermaid
graph LR
    subgraph "Public Network"
        Internet[Internet]
    end

    subgraph "DMZ"
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end

    subgraph "Application Network"
        Gateway[API Gateway]
        Services[Microservices]
    end

    subgraph "Data Network"
        DB[Database Cluster]
        Cache[Redis Cluster]
        Storage[File Storage]
    end

    subgraph "Management Network"
        Monitoring[Monitoring Stack]
        DevOps[DevOps Tools]
    end

    Internet --> WAF
    WAF --> LB
    LB --> Gateway
    Gateway --> Services
    Services --> DB
    Services --> Cache
    Services --> Storage
    Services --> Monitoring
    DevOps --> Services
    DevOps --> DB
    DevOps --> Cache
    DevOps --> Storage

    classDef public fill:#ffebee,stroke:#c62828
    classDef dmz fill:#fff3e0,stroke:#ef6c00
    classDef app fill:#e8f5e8,stroke:#2e7d32
    classDef data fill:#f3e5f5,stroke:#6a1b9a
    classDef mgmt fill:#fafafa,stroke:#424242

    class Internet public
    class LB,WAF dmz
    class Gateway,Services app
    class DB,Cache,Storage data
    class Monitoring,DevOps mgmt
```

---

## 📊 Deployment Architecture

### **Kubernetes Cluster Layout**
```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress Layer"
            Ingress[NGINX Ingress]
            CertManager[Cert Manager]
        end

        subgraph "Application Layer"
            subgraph "Frontend Pods"
                Web1[Web Pod 1]
                Web2[Web Pod 2]
                Web3[Web Pod 3]
            end
            
            subgraph "Backend Pods"
                API1[API Pod 1]
                API2[API Pod 2]
                API3[API Pod 3]
                API4[API Pod 4]
                API5[API Pod 5]
            end
        end

        subgraph "Data Layer"
            PostgreSQL[(PostgreSQL<br/>Primary)]
            PostgreSQLReplica[(PostgreSQL<br/>Replica)]
            Redis[(Redis<br/>Master)]
            RedisSlave[(Redis<br/>Slave)]
        end

        subgraph "Monitoring Layer"
            Prometheus[Prometheus]
            Grafana[Grafana]
            AlertManager[Alert Manager]
        end
    end

    subgraph "External Services"
        CDN[CDN]
        DNS[DNS]
        LoadBalancer[Load Balancer]
    end

    CDN --> LoadBalancer
    LoadBalancer --> Ingress
    Ingress --> Web1
    Ingress --> Web2
    Ingress --> Web3
    
    Web1 --> API1
    Web2 --> API2
    Web3 --> API3
    
    API1 --> PostgreSQL
    API2 --> PostgreSQL
    API3 --> PostgreSQL
    API4 --> PostgreSQLReplica
    API5 --> PostgreSQLReplica
    
    API1 --> Redis
    API2 --> Redis
    API3 --> Redis
    API4 --> RedisSlave
    API5 --> RedisSlave
    
    Prometheus --> API1
    Prometheus --> API2
    Prometheus --> API3
    Prometheus --> API4
    Prometheus --> API5
    
    Grafana --> Prometheus
    AlertManager --> Prometheus

    classDef ingress fill:#e3f2fd,stroke:#1565c0
    classDef app fill:#e8f5e8,stroke:#2e7d32
    classDef data fill:#fce4ec,stroke:#c2185b
    classDef monitoring fill:#f3e5f5,stroke:#6a1b9a
    classDef external fill:#fff3e0,stroke:#ef6c00

    class Ingress,CertManager ingress
    class Web1,Web2,Web3,API1,API2,API3,API4,API5 app
    class PostgreSQL,PostgreSQLReplica,Redis,RedisSlave data
    class Prometheus,Grafana,AlertManager monitoring
    class CDN,DNS,LoadBalancer external
```

---

## 🔐 Security Architecture

### **Authentication & Authorization Flow**
```mermaid
graph TD
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "Security Layer"
        WAF[Web Application Firewall]
        RateLimit[Rate Limiting]
        Auth[Authentication Service]
        RBAC[Role-Based Access Control]
    end

    subgraph "Application Layer"
        Services[Microservices]
        API[API Gateway]
    end

    subgraph "Data Layer"
        Database[(Database)]
        Cache[(Redis Cache)]
    end

    Browser --> WAF
    Mobile --> WAF
    WAF --> RateLimit
    RateLimit --> Auth
    
    Auth --> RBAC
    RBAC --> API
    API --> Services
    
    Services --> Database
    Services --> Cache
    
    Auth --> Cache
    RBAC --> Cache

    classDef client fill:#e8f5e8,stroke:#2e7d32
    classDef security fill:#ffebee,stroke:#c62828
    classDef app fill:#e3f2fd,stroke:#1565c0
    classDef data fill:#fce4ec,stroke:#c2185b

    class Browser,Mobile client
    class WAF,RateLimit,Auth,RBAC security
    class Services,API app
    class Database,Cache data
```

---

## 📈 Performance & Scalability

### **Auto-scaling Architecture**
```mermaid
graph TB
    subgraph "Metrics Collection"
        Prometheus[Prometheus]
        NodeExporter[Node Exporter]
        KubeStateMetrics[Kube State Metrics]
    end

    subgraph "Scaling Logic"
        HPA[Horizontal Pod Autoscaler]
        VPA[Vertical Pod Autoscaler]
        ClusterAutoscaler[Cluster Autoscaler]
    end

    subgraph "Kubernetes Cluster"
        subgraph "Application Pods"
            Pod1[Pod 1]
            Pod2[Pod 2]
            Pod3[Pod 3]
            PodN[Pod N]
        end
        
        subgraph "Node Groups"
            NodeGroup1[Node Group 1]
            NodeGroup2[Node Group 2]
        end
    end

    subgraph "Cloud Infrastructure"
        EC2[EC2 Instances]
        ASG[Auto Scaling Group]
    end

    Prometheus --> HPA
    Prometheus --> VPA
    Prometheus --> ClusterAutoscaler
    
    HPA --> Pod1
    HPA --> Pod2
    HPA --> Pod3
    HPA --> PodN
    
    VPA --> Pod1
    VPA --> Pod2
    VPA --> Pod3
    VPA --> PodN
    
    ClusterAutoscaler --> NodeGroup1
    ClusterAutoscaler --> NodeGroup2
    
    NodeGroup1 --> EC2
    NodeGroup2 --> EC2
    
    ASG --> EC2

    classDef metrics fill:#e8f5e8,stroke:#2e7d32
    classDef scaling fill:#fff3e0,stroke:#ef6c00
    classDef k8s fill:#e3f2fd,stroke:#1565c0
    classDef cloud fill:#fce4ec,stroke:#c2185b

    class Prometheus,NodeExporter,KubeStateMetrics metrics
    class HPA,VPA,ClusterAutoscaler scaling
    class Pod1,Pod2,Pod3,PodN,NodeGroup1,NodeGroup2 k8s
    class EC2,ASG cloud
```

---

*This diagram provides a comprehensive visual representation of the Engineering Forge system architecture, showing all components, their relationships, and data flow patterns. The diagrams are designed to be easily understood by both technical and non-technical stakeholders.*
