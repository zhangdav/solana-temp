# Solana Development Projects

This repository contains a collection of Solana blockchain projects using the Anchor framework. Each project demonstrates different aspects of Solana development, from basic smart contracts to more complex decentralized applications.

## Projects Overview

### Favorites
A simple Solana program that allows users to store their favorite number, color, and hobbies on-chain. This project demonstrates basic Anchor program structure, account creation, and data storage.

- **Program ID**: 9U8dmFf85HM4AWNNasgVFSF3ujXQkPDwvPGaZqSNoKBP
- **Features**: PDA (Program Derived Address) accounts, string and vector storage

### CRUD DApp
A journal entry application that demonstrates Create, Read, Update, and Delete operations on Solana. Includes a Next.js frontend for interacting with the program.

- **Program ID**: 9wg7BZjxcEpAqWhoiYGUT2hZM9iK6vcWGTYDah5mRVjC
- **Features**: Full CRUD operations, Next.js frontend, account management

### Token Lottery
A token-based lottery system built on Solana. Users can enter the lottery using custom tokens.

- **Features**: Custom token integration, randomness implementation, prize distribution

### Lending
A simplified lending protocol that allows users to deposit assets and borrow against them.

- **Features**: Interest rate calculations, collateralization, liquidation mechanisms

### New NFT
A project for creating and managing NFTs on Solana.

- **Features**: NFT minting, metadata management, token standards

### New Token
A template for creating custom SPL tokens on Solana.

- **Features**: Token creation, minting, and distribution

### Stablecoin
An implementation of a stablecoin on Solana with price stability mechanisms.

- **Features**: Price oracles, stability algorithms, reserve management

### Swap
A token swap protocol for exchanging different tokens on Solana.

- **Features**: Automated market maker, liquidity pools, price discovery

### Token Vesting
A vesting contract for gradually releasing tokens to recipients over time.

- **Features**: Time-locked releases, vesting schedules, claim mechanisms

### Voting DApp
A decentralized voting application built on Solana.

- **Features**: Proposal creation, voting mechanisms, result tabulation

## Getting Started

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

2. Navigate to a specific project:
   ```bash
   cd favorites
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Build the Anchor program:
   ```bash
   anchor build
   ```

5. Deploy to a Solana network (e.g., devnet):
   ```bash
   anchor deploy
   ```

### Configuration

Most projects use environment variables for configuration. Copy the `.env.example` file to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

## Testing

Run tests for a specific project:

```bash
cd project-name
anchor test
```

## Deployment

Projects can be deployed to Solana devnet or mainnet using Anchor:

```bash
solana config set --url devnet  # or mainnet
anchor deploy
```

## License

This repository is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Solana Foundation
- Anchor Framework developers
- Solana developer community
