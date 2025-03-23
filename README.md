# Blockchain-Powered University Voting System

A secure and transparent voting platform for university student elections, powered by blockchain technology.

## Features

- Secure student authentication via university LDAP/SSO
- Blockchain-based vote recording and tallying
- Real-time election results and transparency
- Admin dashboard for election management
- Voter anonymity with cryptographic protection
- Mobile-responsive design

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Blockchain: Ethereum (Private Network) + Solidity
- Database: PostgreSQL
- Authentication: OAuth2/LDAP integration

## Project Structure

```
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── smart-contracts/   # Ethereum smart contracts
└── docs/             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL
- Ethereum development environment (Truffle/Hardhat)
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install

   # Smart Contracts
   cd smart-contracts
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm start

   # Backend
   cd backend
   npm run dev

   # Smart Contracts (in a separate terminal)
   cd smart-contracts
   npx hardhat node
   ```

## Security Considerations

- All votes are encrypted and stored on the blockchain
- Voter identities are protected through cryptographic hashing
- Smart contracts are audited for security vulnerabilities
- Rate limiting and DDoS protection implemented
- Regular security audits and updates

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 