# Obscure Gaming UI

Obscure Gaming UI is the frontend for the Obscure Gaming platform, providing a modern, interactive interface for a variety of mini-games and user features. Built with React and TypeScript, it connects to the core backend for game logic and user management.

## Features
- Game Catalog: Browse and launch a variety of games (Dice Game, Maze Game, Memory Matching, Mindful Fractal, Physics Interactive, Rock The Beat, Simon Game, Sudoku, TicTacToe, Tower Defense, Trivia Quiz, Whack-A-Mole, Word Search)
- User Authentication: Login, Register, Profile management
- Leaderboard: View top players and scores
- Online Players: See who is currently online
- Game Details: Rules, stats, and scoring for each game
- Responsive Design: Works on desktop and mobile

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```
The app will run locally at `http://localhost:3000`.

## Project Structure
```
obscureGamingUi/
├── public/           # Static assets
├── src/              # Source code
│   ├── components/   # Shared UI components
│   ├── games/        # Individual game modules
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Main pages (Dashboard, Login, etc.)
│   ├── services/     # API service layer
│   └── types/        # TypeScript types
├── package.json      # Project metadata and scripts
└── tsconfig.json     # TypeScript configuration
```

## Available Scripts
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs tests

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
