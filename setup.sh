#!/bin/bash

# SecureVote - Automated Setup Script
# This script creates the entire project structure and initializes all packages

set -e  # Exit on error

echo "🚀 Setting up SecureVote - Blockchain Voting System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 22.x${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✓ Prerequisites satisfied${NC}"

# Create project root
PROJECT_NAME="securevote"
echo -e "${YELLOW}Creating project: ${PROJECT_NAME}${NC}"

mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create main directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"

# Apps
mkdir -p apps/contracts/{contracts,scripts,test,ignition/modules}
mkdir -p apps/contracts/contracts/{interfaces,libraries}
mkdir -p apps/web/src/{app,components,lib,hooks,contexts,styles}
mkdir -p apps/web/src/app/{auth,voter,admin}
mkdir -p apps/web/src/components/{ui,wallet,voting,election}
mkdir -p apps/web/public/{images,icons}
mkdir -p apps/api/src/{config,controllers,models,routes,middleware,services,utils}
mkdir -p apps/api/test

# Packages
mkdir -p packages/types/src
mkdir -p packages/crypto/src
mkdir -p packages/config/{eslint-config,typescript-config,prettier-config}

# Scripts
mkdir -p scripts

# Docker
mkdir -p docker

# Docs
mkdir -p docs/{research-paper,architecture,api,guides}
mkdir -p docs/architecture/diagrams
mkdir -p docs/research-paper/{figures,tables}

# Tests
mkdir -p tests/{e2e,integration,performance}

# GitHub workflows
mkdir -p .github/workflows

echo -e "${GREEN}✓ Directory structure created${NC}"

# Create root package.json
echo -e "${YELLOW}Creating root package.json...${NC}"
cat > package.json << 'EOF'
{
  "name": "securevote",
  "version": "1.0.0",
  "private": true,
  "description": "SecureVote - A Privacy-Preserving, Verifiable Blockchain Voting System",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "contracts:deploy": "pnpm --filter contracts deploy",
    "contracts:test": "pnpm --filter contracts test",
    "api:dev": "pnpm --filter api dev",
    "web:dev": "pnpm --filter web dev",
    "setup": "pnpm install && pnpm build"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "prettier": "^3.3.3",
    "turbo": "^2.1.0",
    "typescript": "^5.6.2"
  },
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.10.0"
}
EOF

# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Create turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "artifacts/**", "cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Create root tsconfig.json
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist"]
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
dist/
build/
.next/
out/

# Environment
.env
.env*.local
.env.production

# Hardhat
artifacts/
cache/
typechain-types/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo

# Misc
*.pem
*.log
.vercel
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Backend
MONGODB_URI=mongodb://localhost:27017/securevote
JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111

# Encryption Keys
RSA_PUBLIC_KEY_PATH=./keys/public.pem
RSA_PRIVATE_KEY_PATH=./keys/private.pem
AES_SECRET_KEY=your_aes_256_bit_key_here

# IPFS (Optional)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/
EOF

echo -e "${GREEN}✓ Root configuration files created${NC}"

# ==================== APPS/CONTRACTS ====================
echo -e "${YELLOW}Setting up contracts...${NC}"

cd apps/contracts

cat > package.json << 'EOF'
{
  "name": "contracts",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "coverage": "hardhat coverage",
    "deploy": "hardhat ignition deploy ./ignition/modules/VotingSystem.ts --network sepolia",
    "verify": "hardhat verify",
    "node": "hardhat node",
    "clean": "hardhat clean"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-chai-matchers": "^2.0.7",
    "@nomicfoundation/hardhat-ethers": "^3.0.8",
    "@nomicfoundation/hardhat-ignition": "^0.15.5",
    "@nomicfoundation/hardhat-ignition-ethers": "^0.15.5",
    "@nomicfoundation/hardhat-network-helpers": "^1.0.11",
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@nomicfoundation/hardhat-verify": "^2.0.9",
    "@typechain/ethers-v6": "^0.5.1",
    "@typechain/hardhat": "^9.1.0",
    "@types/chai": "^4.3.19",
    "@types/mocha": "^10.0.8",
    "chai": "^4.5.0",
    "hardhat": "^2.22.12",
    "hardhat-gas-reporter": "^2.2.1",
    "solidity-coverage": "^0.8.13",
    "ts-node": "^10.9.2",
    "typechain": "^8.3.2",
    "typescript": "^5.6.2"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.2",
    "dotenv": "^16.4.5",
    "ethers": "^6.13.2"
  }
}
EOF

cat > hardhat.config.ts << 'EOF'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["node", "mocha"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

cd ../..

# ==================== APPS/WEB ====================
echo -e "${YELLOW}Setting up frontend (Next.js 15)...${NC}"

cd apps/web

cat > package.json << 'EOF'
{
  "name": "web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.2",
    "@rainbow-me/rainbowkit": "^2.1.6",
    "@tanstack/react-query": "^5.56.2",
    "axios": "^1.7.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "ethers": "^6.13.2",
    "lucide-react": "^0.446.0",
    "next": "15.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "viem": "^2.21.9",
    "wagmi": "^2.12.11",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.8",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "15.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "typescript": "^5.6.2"
  }
}
EOF

cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
};

export default nextConfig;
EOF

cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cd ../..

# ==================== APPS/API ====================
echo -e "${YELLOW}Setting up backend API...${NC}"

cd apps/api

cat > package.json << 'EOF'
{
  "name": "api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/morgan": "^1.9.9",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^16.4.5",
    "ethers": "^6.13.2",
    "express": "^4.19.2",
    "express-validator": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.6.3",
    "morgan": "^1.10.0",
    "winston": "^3.14.2"
  },
  "devDependencies": {
    "@types/node": "^22.5.5",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "vitest": "^2.1.1"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

cd ../..

echo -e "${GREEN}✓ All package.json files created${NC}"
echo -e "${YELLOW}Running pnpm install...${NC}"

pnpm install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SecureVote setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. cd securevote"
echo "2. Copy .env.example to .env and fill in your values"
echo "3. Run 'pnpm dev' to start development servers"
echo ""
echo "Structure:"
echo "- apps/contracts  → Smart contracts"
echo "- apps/web       → Next.js frontend"
echo "- apps/api       → Express backend"
echo "- packages       → Shared code"