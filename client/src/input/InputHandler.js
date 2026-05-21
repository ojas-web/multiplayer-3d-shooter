class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.mousePosition = { x: 0, y: 0 };
    this.camera = game.camera;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.targetQuaternion = new THREE.Quaternion();
    
    // Camera settings
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.add(this.pitchObject);
    this.pitchObject.add(this.camera);
    this.camera.position.y = 1.6; // Eye height
    
    this.game.scene.add(this.yawObject);
    
    // Lock pointer
    this.pointerLocked = false;
    
    // Bind events
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('click', () => this.requestPointerLock());
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
  }

  requestPointerLock() {
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
    document.body.requestPointerLock();
  }

  onPointerLockChange() {
    this.pointerLocked = document.pointerLockElement === document.body ||
                         document.mozPointerLockElement === document.body;
  }

  onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    
    // Shooting
    if (e.key === ' ' && this.game.playerId) {
      this.shoot();
    }
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  onMouseMove(e) {
    if (!this.pointerLocked) return;
    
    const movementX = e.movementX || e.mozMovementX || 0;
    const movementY = e.movementY || e.mozMovementY || 0;
    
    const sensitivity = 0.005;
    this.euler.setFromQuaternion(this.yawObject.quaternion);
    this.euler.rotateY(-movementX * sensitivity);
    this.euler.rotateX(-movementY * sensitivity);
    
    // Clamp pitch
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
    this.yawObject.quaternion.setFromEuler(this.euler);
  }

  shoot() {
    const origin = this.camera.position.clone();
    this.camera.getWorldDirection(new THREE.Vector3());
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    this.game.networkManager.sendShot({
      x: origin.x,
      y: origin.y,
      z: origin.z
    }, {
      x: direction.x,
      y: direction.y,
      z: direction.z
    });
  }

  update() {
    // Calculate movement direction
    const moveDirection = new THREE.Vector3();
    const moveSpeed = 0.2;
    
    if (this.keys['w']) moveDirection.z -= moveSpeed;
    if (this.keys['s']) moveDirection.z += moveSpeed;
    if (this.keys['a']) moveDirection.x -= moveSpeed;
    if (this.keys['d']) moveDirection.x += moveSpeed;
    
    // Apply movement in world space
    const worldDirection = new THREE.Vector3();
    worldDirection.copy(moveDirection);
    worldDirection.applyQuaternion(this.yawObject.quaternion);
    
    this.yawObject.position.add(worldDirection);
    
    // Clamp position to map bounds
    this.yawObject.position.x = Math.max(-95, Math.min(95, this.yawObject.position.x));
    this.yawObject.position.z = Math.max(-95, Math.min(95, this.yawObject.position.z));
    this.yawObject.position.y = 0; // Keep on ground
    
    // Send input to server periodically
    const input = {
      forward: this.keys['w'] || false,
      backward: this.keys['s'] || false,
      left: this.keys['a'] || false,
      right: this.keys['d'] || false,
      jump: this.keys[' '] || false
    };
    
    this.game.networkManager.sendInput(input);
    
    // Send position update
    this.game.networkManager.sendPlayerMove(
      {
        x: this.yawObject.position.x,
        y: this.yawObject.position.y,
        z: this.yawObject.position.z
      },
      {
        x: this.euler.x,
        y: this.euler.y,
        z: this.euler.z
      }
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}
