class GameClient {
  constructor(game) {
    this.game = game;
    this.playerMeshes = new Map();
    this.lastUpdateTime = Date.now();
  }

  updateGameState(gameState) {
    // Update or create player meshes
    for (const player of gameState.players) {
      if (!this.playerMeshes.has(player.id)) {
        const isLocal = player.id === this.game.playerId;
        const mesh = this.createPlayerMesh(player, isLocal);
        this.playerMeshes.set(player.id, mesh);
      }
      
      const mesh = this.playerMeshes.get(player.id);
      if (mesh) {
        mesh.position.copy(player.position);
        mesh.rotation.copy(player.rotation);
        
        // Update material based on team and health
        if (!this.game.playerId || player.id !== this.game.playerId) {
          const healthRatio = Math.max(0, player.health) / 100;
          if (player.team === 'RED') {
            mesh.material.color.setHex(0xff0000);
          } else {
            mesh.material.color.setHex(0x0000ff);
          }
        }
      }
    }
    
    // Remove disconnected players
    for (const [id, mesh] of this.playerMeshes) {
      if (!gameState.players.find(p => p.id === id)) {
        this.game.scene.remove(mesh);
        this.playerMeshes.delete(id);
      }
    }
  }

  createPlayerMesh(player, isLocal) {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.8, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: player.team === 'RED' ? 0xff0000 : 0x0000ff,
      roughness: 0.7,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 1;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcb69,
      roughness: 0.5,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    head.position.y = 2.2;
    group.add(head);
    
    // Weapon (rifle)
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const weaponMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.9
    });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(0.3, 1.5, -0.5);
    weapon.castShadow = true;
    group.add(weapon);
    
    // Health bar
    const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.y = 2.8;
    healthBar.position.z = 0.01;
    group.add(healthBar);
    
    group.position.copy(player.position);
    group.rotation.copy(player.rotation);
    group.castShadow = true;
    group.userData = { playerId: player.id };
    
    this.game.scene.add(group);
    return group;
  }

  createObstacles(obstacles) {
    // Clear existing obstacles
    for (const obstacle of this.game.obstacles) {
      this.game.scene.remove(obstacle);
    }
    this.game.obstacles = [];
    
    // Create new obstacles
    for (const obs of obstacles) {
      const geometry = new THREE.BoxGeometry(obs.size.x, obs.size.y, obs.size.z);
      const material = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.3
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(obs.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = obs;
      
      this.game.scene.add(mesh);
      this.game.obstacles.push(mesh);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameClient;
}
