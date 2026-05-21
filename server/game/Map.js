class Map {
  constructor() {
    this.name = 'Arena';
    this.width = 200;
    this.height = 200;
    this.obstacles = this.generateObstacles();
    this.spawnPoints = {
      RED: { x: -50, y: 2, z: -50 },
      BLUE: { x: 50, y: 2, z: 50 }
    };
  }

  generateObstacles() {
    const obstacles = [];
    
    // Central structure
    obstacles.push({
      position: { x: 0, y: 0, z: 0 },
      size: { x: 20, y: 10, z: 20 },
      type: 'platform'
    });
    
    // Corner towers
    const corners = [
      { x: -70, z: -70 },
      { x: 70, z: -70 },
      { x: -70, z: 70 },
      { x: 70, z: 70 }
    ];
    
    for (const corner of corners) {
      obstacles.push({
        position: { x: corner.x, y: 0, z: corner.z },
        size: { x: 15, y: 15, z: 15 },
        type: 'tower'
      });
    }
    
    // Side walls
    for (let i = 0; i < 4; i++) {
      const x = -80 + i * 50;
      obstacles.push({
        position: { x, y: 0, z: -80 },
        size: { x: 10, y: 8, z: 5 },
        type: 'wall'
      });
    }
    
    // Central pillars
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) continue; // Skip center
        obstacles.push({
          position: { x: (i - 1) * 30, y: 0, z: (j - 1) * 30 },
          size: { x: 8, y: 12, z: 8 },
          type: 'pillar'
        });
      }
    }
    
    return obstacles;
  }

  getSpawnPoint(team) {
    const base = this.spawnPoints[team];
    // Add small random variation
    return {
      x: base.x + (Math.random() - 0.5) * 20,
      y: base.y,
      z: base.z + (Math.random() - 0.5) * 20
    };
  }

  isPositionValid(position) {
    // Check map bounds
    if (Math.abs(position.x) > 100 || Math.abs(position.z) > 100) {
      return false;
    }
    
    // Check collision with obstacles
    const playerRadius = 2;
    for (const obstacle of this.obstacles) {
      const dx = Math.abs(position.x - obstacle.position.x);
      const dz = Math.abs(position.z - obstacle.position.z);
      
      if (dx < obstacle.size.x / 2 + playerRadius && dz < obstacle.size.z / 2 + playerRadius) {
        return false;
      }
    }
    
    return true;
  }

  getObstacles() {
    return this.obstacles;
  }
}

module.exports = Map;
