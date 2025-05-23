# Solana Development Projects

This repository contains Solana blockchain projects built with the Anchor framework. Each project showcases different aspects of Solana development, from basic smart contracts to complex dApps.

## Projects Overview

### Favorites
A simple program allowing users to store favorite number, color, and hobbies on-chain.

- **Program ID**: 9U8dmFf85HM4AWNNasgVFSF3ujXQkPDwvPGaZqSNoKBP
- **Features**: PDA accounts, string and vector storage

### CRUD DApp
A journal application demonstrating Create, Read, Update, Delete operations with a Next.js frontend.

- **Program ID**: 9wg7BZjxcEpAqWhoiYGUT2hZM9iK6vcWGTYDah5mRVjC
- **Features**: Full CRUD operations, Next.js frontend, account management

### Token Lottery
Token-based lottery system where users enter using custom tokens.

- **Features**: Custom token integration, randomness, prize distribution

### Lending
Simplified lending protocol for depositing assets and borrowing against them.

- **Features**: Interest calculation, collateralization, liquidation mechanisms

### NFT
Project for creating and managing NFTs on Solana.

- **Features**: NFT minting, metadata management, token standards

### Token
Template for creating custom SPL tokens.

- **Features**: Token creation, minting, distribution

### Stablecoin
Stablecoin implementation with price stability mechanisms.

- **Features**: Price oracles, stability algorithms, reserve management

### Swap
Token swap protocol for exchanging tokens on Solana.

- **Features**: Automated market maker, liquidity pools, price discovery

### Token Vesting
Contract for gradually releasing tokens to recipients over time.

- **Features**: Time-locked releases, vesting schedules, claim mechanisms

### Voting DApp
Decentralized voting application.

- **Features**: Proposal creation, voting mechanisms, result tabulation

## Development Guide

### Prerequisites
- Rust and Cargo
- Solana CLI tools
- Node.js and npm/yarn
- Anchor framework

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solana-temp.git
   cd solana-temp
   ```

2. Navigate to a project:
   ```bash
   cd favorites
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Build the program:
   ```bash
   anchor build
   ```

5. Deploy:
   ```bash
   anchor deploy
   ```

### Configuration

Create environment variables:
```bash
cp .env.example .env
```

## Testing

```bash
cd project-name
anchor test
```

## Deployment

```bash
solana config set --url devnet  # or mainnet
anchor deploy
```

## License

MIT License

## Acknowledgments

- Solana Foundation
- Anchor Framework developers
- Solana developer community