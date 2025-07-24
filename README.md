# Pangolines

A modern Vue 3 reinterpretation of the classic arcade game Pang, featuring polished bubble-popping mechanics, responsive controls, retro visuals, and a robust, maintainable architecture.

## Features

- Player-controlled character with smooth horizontal movement
- Fire vertical projectiles to pop and split bouncing bubbles
- Realistic bubble physics and collision detection
- Two game modes: Arcade (endless) & Classic (progressive levels)
- High score tracking (persistent via localStorage)
- Power-ups store and upgrade system
- Modular, maintainable codebase with reusable UI components
- Responsive design and global styles
- **Debug Mode:** Visualize collision hitboxes for bubbles, player, and projectiles (see below)

## Debug Mode

You can enable a debug mode during gameplay to visualize collision areas:

- **How to enable:** Press the <kbd>D</kbd> key while playing to toggle debug mode on or off.
- **What it does:**
  - Draws red outlines around all bubble hitboxes
  - Draws blue outlines around the player hitbox (body and head)
  - Draws green outlines around projectile hitboxes
- Use this to test and debug collision detection, especially for edge cases or new features.

## Game Modes

### Arcade Mode
- Single, continuous level with dynamic difficulty
- Play until game over

### Classic Mode
- Progressive levels with increasing bubble count and speed
- Unique bubble configurations per level
- Points awarded by bubble size

## Power-Ups System

The game features a comprehensive power-up system with 12 different upgrades that can be purchased using earned points. Power-ups are permanent once purchased and automatically activate their effects during gameplay.

### Movement & Player Enhancements

| Power-Up | Cost | Description | Activation |
|----------|------|-------------|------------|
| **Faster Movement** | 300 | Increases player movement speed from 5 to 8 units | Automatic |
| **Shield** | 800 | Provides 5 seconds of protection from bubbles with pulsing cyan visual effect | Press **S** key |
| **Extra Life** | 1200 | Grants one additional life (increases from 3 to 4 lives) | Automatic |

### Projectile Enhancements

| Power-Up | Cost | Description | Visual Effect |
|----------|------|-------------|---------------|
| **Larger Shots** | 500 | Increases projectile width from 4 to 8 pixels | Standard white |
| **Double Projectiles** | 600 | Fires two projectiles simultaneously with slight offset | Standard white |
| **Multi-Shot** | 750 | Fires 3 projectiles in a spread pattern | Yellow color |
| **Rapid Fire** | 650 | Increases projectile speed and allows up to 3 simultaneous shots | Standard white |
| **Piercing Shots** | 850 | Projectiles pass through up to 3 bubbles before disappearing | Magenta color |
| **Homing Projectiles** | 1000 | Projectiles automatically seek nearby bubbles within 200px range | Cyan color |
| **Explosive Projectiles** | 700 | Projectiles explode on impact for area damage | Standard white |

### Special Abilities

| Power-Up | Cost | Description | Activation |
|----------|------|-------------|------------|
| **Slow Time** | 900 | Slows down all game elements to 50% speed for 10 seconds | Press **T** key |
| **Magnetic Collector** | 550 | Automatically attracts score pickups within 150px range | Automatic |

### Power-Up Combinations

Power-ups can be combined for enhanced effects:
- **Multi-Shot + Piercing**: Each of the 3 projectiles can pierce through bubbles
- **Homing + Explosive**: Seeking projectiles that explode on impact
- **Rapid Fire + Larger Shots**: Fast, thick projectiles for maximum coverage
- **Shield + Slow Time**: Ultimate defensive combination for difficult situations

### Usage Tips

- **Shield** and **Slow Time** are activated manually - save them for challenging moments
- **Homing Projectiles** work best in crowded bubble scenarios
- **Piercing Shots** are most effective against lines of bubbles
- **Multi-Shot** provides excellent coverage for scattered bubbles
- **Magnetic Collector** is invaluable for score optimization

## Controls

### Basic Controls
- **Left/Right Arrow Keys:** Move the player
- **Spacebar:** Fire a projectile upward

### Power-Up Activation
- **S Key:** Activate Shield (if purchased)
- **T Key:** Activate Slow Time (if purchased)
- **D Key:** Toggle debug mode (development feature)

## Project Architecture

The project is structured for scalability and maintainability, with a clear separation of game logic, UI, and utilities:

```
/src
  ├── core
  │   ├── entities/      # Game entities (player, bubbles)
  │   ├── systems/       # Game systems (collisions, projectiles)
  │   └── managers/      # Game managers (game loop, state)
  ├── components
  │   ├── screens/       # Main screen components (MainMenu, GameScreen, Store, GameOver)
  │   └── ui/            # Reusable UI components (buttons, score display)
  ├── styles/            # Global and shared CSS
  ├── utils/             # Utility/helper functions (debounce, clamp, storage)
  ├── store.js           # Reactive store for score, power-ups, etc.
  └── main.js            # App entry point
```

### Directory Overview
- **core/entities/**: Pure game objects and state (e.g., `player.js`, `bubbles.js`)
- **core/systems/**: Game logic and rules (e.g., `collisions.js`, `projectiles.js`)
- **core/managers/**: Game loop and orchestration (e.g., `gameLoop.js`)
- **components/screens/**: Main UI screens, each representing a distinct game state
- **components/ui/**: Reusable, presentational UI elements (e.g., `UIButton.vue`, `Score.vue`)
- **styles/**: Global styles (`global.css`) and shared CSS
- **utils/**: General-purpose helper functions (`helpers.js`)
- **store.js**: Reactive store for game state, power-ups, and score

### Game Loop & State Management
- The main game loop is managed via a composable (`useGameLoop`) in `core/managers/gameLoop.js`, using `requestAnimationFrame` for smooth updates.
- Game state is modularized: entities (player, bubbles), systems (collisions, projectiles), and managers (game loop) are each isolated for clarity and testability.
- UI screens (MainMenu, GameScreen, StoreScreen, GameOverScreen) are conditionally rendered based on game state, managed in `Game.vue`.
- Power-ups and score are managed in a reactive store (`store.js`), with persistent high scores via localStorage helpers in `utils/helpers.js`.
- Utility functions (debounce, clamp, random, storage) are centralized in `/utils` for reuse.

### Technologies Used
- **Vue 3** with Composition API (`<script setup>`, `ref`, etc.)
- **Vite** for fast development
- **Modular, event-driven architecture**
- **Global and component-scoped styles**

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please open issues or PRs for suggestions, bug fixes, or new features.

## License

MIT

---

*This project structure and documentation reflect the latest architectural refactor as of June 2025.*
