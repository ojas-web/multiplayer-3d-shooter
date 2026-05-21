# 🎮 Multiplayer 3D Shooter

A web-based multiplayer 3D FPS game engine built with **Three.js**, **Node.js**, and **WebSockets**.

## Features

✅ **Real-time Multiplayer** - WebSocket-based server with 60 FPS game loop
✅ **Team-Based Gameplay** - Red vs Blue team deathmatch
✅ **3D Rendering** - Three.js with shadows, lighting, and visual effects
✅ **First-Person Shooter** - Full FPS controls with mouse look
✅ **Network Synchronization** - Continuous state sync between server and clients
✅ **Weapon System** - Shooting mechanics with ammo tracking
✅ **Dynamic Level Design** - Procedurally generated maps with obstacles
✅ **Live Statistics** - HUD with health, ammo, kills/deaths, team scores
✅ **Radar System** - Real-time position tracking on minimap

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ojas-web/multiplayer-3d-shooter.git
cd multiplayer-3d-shooter

# Install dependencies
npm install
```

### Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000`

### Building the Client

```bash
# Build for production
npm run build

# Watch mode (development)
npm run build:dev
```

## Controls

### Movement
- **W** - Move Forward
- **A** - Move Left
- **S** - Move Backward
- **D** - Move Right
- **Mouse** - Look Around
- **Click** - Fire Weapon

### UI
- The game displays your health, ammo, kills, and deaths
- Team scores are displayed in the top right
- Minimap in bottom left shows player positions

## Game Modes

### Team Deathmatch (Current)
- 2 teams: Red vs Blue
- Automatic team balancing on join
- First to X kills wins (configurable)
- 10-minute rounds

### Planned Game Modes
- Capture the Flag
- Domination
- Search & Destroy
- King of the Hill

## Architecture

### Backend (Server)
- **Express.js** - Web server
- **WebSocket (ws)** - Real-time communication
- **Custom Game Engine** - Game logic, physics, state management

**Key Files:**
- `server/index.js` - Entry point
- `server/game/GameServer.js` - Main game loop and logic
- `server/game/Player.js` - Player class
- `server/game/Map.js` - Map generation and boundaries
- `server/game/GameState.js` - Game state management

### Frontend (Client)
- **Three.js** - 3D graphics rendering
- **WebGL** - GPU-accelerated rendering
- **Custom Game Client** - Local game state and rendering

**Key Files:**
- `client/index.html` - Main HTML with HUD
- `client/src/index.js` - Game initialization
- `client/src/network/NetworkManager.js` - WebSocket handling
- `client/src/game/GameClient.js` - Client-side game logic
- `client/src/input/InputHandler.js` - Input processing and camera control

## Network Protocol

### Client → Server Messages

```json
{
  "type": "PLAYER_MOVE",
  "position": { "x": 0, "y": 1.6, "z": 0 },
  "rotation": { "x": 0, "y": 0, "z": 0 }
}

{
  "type": "PLAYER_SHOOT",
  "origin": { "x": 0, "y": 1.6, "z": 0 },
  "direction": { "x": 0, "y": 0, "z": 1 }
}

{
  "type": "PLAYER_INPUT",
  "input": {
    "forward": true,
    "backward": false,
    "left": false,
    "right": false,
    "jump": false
  }
}
```

### Server → Client Messages

```json
{
  "type": "PLAYER_JOINED",
  "playerId": "uuid",
  "team": "RED",
  "position": { "x": -50, "y": 2, "z": -50 },
  "gameState": { ... }
}

{
  "type": "GAME_STATE_UPDATE",
  "gameState": {
    "players": [ ... ],
    "teamScores": { "RED": 15, "BLUE": 12 },
    "timestamp": 1234567890
  }
}

{
  "type": "SHOT_FIRED",
  "shooterId": "uuid",
  "targetId": "uuid",
  "hit": true,
  "damage": 25
}

{
  "type": "PLAYER_KILLED",
  "killerId": "uuid",
  "victimId": "uuid",
  "killerTeam": "RED",
  "killerKills": 5
}
```

## Performance

- **Server Tick Rate:** 60 FPS
- **Network Update Rate:** 60 Hz
- **Client Render Rate:** 60 FPS (locked to monitor refresh rate)
- **Typical Latency:** 50-100ms
- **Bandwidth Usage:** ~30-50 KB/s per player

## Deployment

### Heroku

```bash
git push heroku main
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### AWS, Google Cloud, Azure

See deployment guides in the docs folder.

## Future Enhancements

- [ ] Additional weapons (shotgun, sniper, rocket launcher)
- [ ] Power-ups and weapons spawns
- [ ] Improved hit detection and registration
- [ ] Anti-cheat system
- [ ] Player customization and loadouts
- [ ] Voice chat integration
- [ ] Replays and kill cams
- [ ] Leaderboards
- [ ] Mobile support (touch controls)
- [ ] Bot AI opponents
- [ ] More game modes
- [ ] Better graphics and shaders
- [ ] Performance optimization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Changelog

### v1.0.0 (Initial Release)
- Basic multiplayer architecture
- Team deathmatch game mode
- First-person camera controls
- Weapon and shooting mechanics
- HUD with statistics
- Network synchronization
