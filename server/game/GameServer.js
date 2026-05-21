const { v4: uuidv4 } = require('uuid');
const Player = require('./Player');
const Map = require('./Map');
const GameState = require('./GameState');

class GameServer {
  constructor() {
    this.players = new Map();
    this.gameState = new GameState();
    this.map = new Map();
    this.tickRate = 60;
    this.tickInterval = 1000 / this.tickRate;
    this.lastTick = Date.now();
    this.gameRunning = true;
  }

  addPlayer(ws) {
    const playerId = uuidv4();
    const team = this.getBalancedTeam();
    const spawnPoint = this.map.getSpawnPoint(team);
    
    const player = new Player(playerId, team, spawnPoint);
    player.ws = ws;
    
    this.players.set(playerId, player);
    
    // Send join confirmation
    ws.send(JSON.stringify({
      type: 'PLAYER_JOINED',
      playerId,
      team,
      position: spawnPoint,
      gameState: this.getGameStateBroadcast()
    }));
    
    // Notify all players
    this.broadcastGameState();
    console.log(`Player ${playerId} joined team ${team}`);
  }

  removePlayer(ws) {
    let removedPlayerId = null;
    for (const [id, player] of this.players) {
      if (player.ws === ws) {
        removedPlayerId = id;
        break;
      }
    }
    
    if (removedPlayerId) {
      this.players.delete(removedPlayerId);
      this.broadcast({
        type: 'PLAYER_LEFT',
        playerId: removedPlayerId
      });
      console.log(`Player ${removedPlayerId} left the game`);
    }
  }

  handleMessage(ws, message) {
    const player = Array.from(this.players.values()).find(p => p.ws === ws);
    if (!player) return;

    switch (message.type) {
      case 'PLAYER_MOVE':
        player.position = message.position;
        player.rotation = message.rotation;
        break;
      
      case 'PLAYER_SHOOT':
        this.handleShot(player, message);
        break;
      
      case 'PLAYER_INPUT':
        player.updateInput(message.input);
        break;
      
      case 'PING':
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;
    }
  }

  handleShot(shooter, message) {
    const { origin, direction } = message;
    
    // Simple raycast hit detection
    let hitPlayer = null;
    let minDistance = Infinity;
    
    for (const [id, player] of this.players) {
      if (player.id === shooter.id || player.isDead) continue;
      
      const distance = this.raycastDistance(origin, direction, player.position);
      if (distance < 2 && distance < minDistance) { // 2 unit collision radius
        minDistance = distance;
        hitPlayer = player;
      }
    }
    
    if (hitPlayer) {
      const damage = 25;
      hitPlayer.takeDamage(damage, shooter.id);
      shooter.ammo = Math.max(0, shooter.ammo - 1);
      
      this.broadcast({
        type: 'SHOT_FIRED',
        shooterId: shooter.id,
        targetId: hitPlayer.id,
        hit: true,
        damage
      });
      
      if (hitPlayer.isDead) {
        shooter.kills++;
        hitPlayer.deaths++;
        
        this.broadcast({
          type: 'PLAYER_KILLED',
          killerId: shooter.id,
          victimId: hitPlayer.id,
          killerTeam: shooter.team,
          killerKills: shooter.kills
        });
        
        // Respawn player after 3 seconds
        setTimeout(() => {
          hitPlayer.respawn(this.map.getSpawnPoint(hitPlayer.team));
          this.broadcastGameState();
        }, 3000);
      }
    } else {
      shooter.ammo = Math.max(0, shooter.ammo - 1);
      this.broadcast({
        type: 'SHOT_FIRED',
        shooterId: shooter.id,
        hit: false
      });
    }
  }

  raycastDistance(origin, direction, targetPos) {
    // Calculate distance from ray to sphere (player)
    const ox = origin.x, oy = origin.y, oz = origin.z;
    const dx = direction.x, dy = direction.y, dz = direction.z;
    const px = targetPos.x - ox, py = targetPos.y - oy, pz = targetPos.z - oz;
    
    const t = Math.max(0, (px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz));
    const closestX = ox + dx * t;
    const closestY = oy + dy * t;
    const closestZ = oz + dz * t;
    
    return Math.sqrt(
      (closestX - targetPos.x) ** 2 +
      (closestY - targetPos.y) ** 2 +
      (closestZ - targetPos.z) ** 2
    );
  }

  getBalancedTeam() {
    let redCount = 0, blueCount = 0;
    for (const player of this.players.values()) {
      if (player.team === 'RED') redCount++;
      else blueCount++;
    }
    return redCount > blueCount ? 'BLUE' : 'RED';
  }

  broadcastGameState() {
    const state = this.getGameStateBroadcast();
    this.broadcast({
      type: 'GAME_STATE_UPDATE',
      gameState: state
    });
  }

  getGameStateBroadcast() {
    const players = Array.from(this.players.values()).map(p => ({
      id: p.id,
      team: p.team,
      position: p.position,
      rotation: p.rotation,
      health: p.health,
      kills: p.kills,
      deaths: p.deaths,
      isDead: p.isDead,
      ammo: p.ammo
    }));
    
    const teamScores = this.calculateTeamScores();
    
    return {
      players,
      teamScores,
      timestamp: Date.now()
    };
  }

  calculateTeamScores() {
    let redKills = 0, blueKills = 0;
    for (const player of this.players.values()) {
      if (player.team === 'RED') redKills += player.kills;
      else blueKills += player.kills;
    }
    return { RED: redKills, BLUE: blueKills };
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    for (const player of this.players.values()) {
      if (player.ws && player.ws.readyState === 1) { // OPEN
        player.ws.send(data);
      }
    }
  }

  start(wss) {
    setInterval(() => {
      this.broadcastGameState();
    }, this.tickInterval);
  }
}

module.exports = GameServer;
