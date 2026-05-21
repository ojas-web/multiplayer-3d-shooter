class Player {
  constructor(id, team, spawnPoint) {
    this.id = id;
    this.team = team;
    this.position = spawnPoint;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    
    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.isDead = false;
    this.kills = 0;
    this.deaths = 0;
    this.ammo = 120;
    this.maxAmmo = 120;
    
    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    this.ws = null;
    this.lastUpdateTime = Date.now();
  }

  takeDamage(amount, shooterId) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

  respawn(spawnPoint) {
    this.position = spawnPoint;
    this.health = this.maxHealth;
    this.isDead = false;
    this.ammo = this.maxAmmo;
  }

  updateInput(input) {
    this.input = input;
  }

  update(deltaTime) {
    if (this.isDead) return;
    
    const moveSpeed = 0.2; // units per millisecond
    const direction = { x: 0, z: 0 };
    
    if (this.input.forward) direction.z -= 1;
    if (this.input.backward) direction.z += 1;
    if (this.input.left) direction.x -= 1;
    if (this.input.right) direction.x += 1;
    
    // Normalize direction
    const length = Math.sqrt(direction.x ** 2 + direction.z ** 2);
    if (length > 0) {
      direction.x /= length;
      direction.z /= length;
    }
    
    this.position.x += direction.x * moveSpeed * deltaTime;
    this.position.z += direction.z * moveSpeed * deltaTime;
    
    // Clamp position to map bounds
    this.position.x = Math.max(-100, Math.min(100, this.position.x));
    this.position.z = Math.max(-100, Math.min(100, this.position.z));
  }
}

module.exports = Player;
