const NetworkManager = require('./network/NetworkManager');
const GameClient = require('./game/GameClient');
const InputHandler = require('./input/InputHandler');

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.loadingScreen = document.getElementById('loading');
    this.hud = document.getElementById('hud');
    
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 500, 1000);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    
    // Lighting
    this.setupLighting();
    
    // Network
    this.networkManager = new NetworkManager(this);
    this.gameClient = new GameClient(this);
    this.inputHandler = new InputHandler(this);
    
    // Game state
    this.playerId = null;
    this.playerTeam = null;
    this.players = new Map();
    this.obstacles = [];
    this.isConnected = false;
    
    // Bind methods
    this.animate = this.animate.bind(this);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    this.scene.add(directionalLight);
    
    // Point lights for team colors
    const redLight = new THREE.PointLight(0xff0000, 0.5, 200);
    redLight.position.set(-80, 50, -80);
    this.scene.add(redLight);
    
    const blueLight = new THREE.PointLight(0x0000ff, 0.5, 200);
    blueLight.position.set(80, 50, 80);
    this.scene.add(blueLight);
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    this.networkManager.connect(wsUrl);
  }

  onConnected(playerId, team) {
    this.playerId = playerId;
    this.playerTeam = team;
    this.isConnected = true;
    this.loadingScreen.style.display = 'none';
    this.hud.style.display = 'block';
    console.log(`Connected as player ${playerId} on team ${team}`);
  }

  updateGameState(gameState) {
    this.gameClient.updateGameState(gameState);
    this.updateHUD(gameState);
  }

  createPlayerMesh(player, isLocalPlayer = false) {
    return this.gameClient.createPlayerMesh(player, isLocalPlayer);
  }

  createObstacles(obstacles) {
    this.gameClient.createObstacles(obstacles);
  }

  updateHUD(gameState) {
    // Find local player
    const localPlayer = gameState.players.find(p => p.id === this.playerId);
    
    if (localPlayer) {
      document.getElementById('health').textContent = Math.max(0, localPlayer.health);
      document.getElementById('ammo').textContent = localPlayer.ammo;
      document.getElementById('kills').textContent = localPlayer.kills;
      document.getElementById('deaths').textContent = localPlayer.deaths;
    }
    
    // Update team scores
    document.getElementById('red-score').textContent = gameState.teamScores.RED || 0;
    document.getElementById('blue-score').textContent = gameState.teamScores.BLUE || 0;
    
    // Update radar
    this.updateRadar(gameState);
  }

  updateRadar(gameState) {
    const radarCanvas = document.getElementById('radarCanvas');
    const ctx = radarCanvas.getContext('2d');
    const scale = 200 / 200; // canvas size / map size
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(0, 0, 200, 200);
    
    const localPlayer = gameState.players.find(p => p.id === this.playerId);
    if (!localPlayer) return;
    
    // Draw other players
    for (const player of gameState.players) {
      if (player.id === this.playerId) continue;
      
      const dx = (player.position.x - localPlayer.position.x) * scale + 100;
      const dy = (player.position.z - localPlayer.position.z) * scale + 100;
      
      ctx.fillStyle = player.team === 'RED' ? '#ff4444' : '#4444ff';
      ctx.fillRect(dx - 2, dy - 2, 4, 4);
    }
    
    // Draw local player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(98, 98, 4, 4);
  }

  animate() {
    requestAnimationFrame(this.animate);
    
    if (this.isConnected) {
      // Update camera based on input
      this.inputHandler.update();
      
      // Render
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize game when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.connect();
    game.animate();
    window.game = game; // Global reference for debugging
  });
} else {
  const game = new Game();
  game.connect();
  game.animate();
  window.game = game;
}
