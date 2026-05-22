class NetworkManager {
  constructor(game) {
    this.game = game;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(url) {
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = (event) => this.onMessage(event);
      this.ws.onclose = () => this.onClose();
      this.ws.onerror = (error) => this.onError(error);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  onOpen() {
    console.log('Connected to server');
    this.reconnectAttempts = 0;
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'PLAYER_JOINED':
        this.game.onConnected(message.playerId, message.team);
        this.game.updateGameState(message.gameState);
        break;
      
      case 'GAME_STATE_UPDATE':
        this.game.updateGameState(message.gameState);
        break;
      
      case 'SHOT_FIRED':
        this.handleShotFired(message);
        break;
      
      case 'PLAYER_KILLED':
        this.handlePlayerKilled(message);
        break;
      
      case 'PLAYER_LEFT':
        console.log(`Player ${message.playerId} left`);
        break;
      
      case 'RELOAD_COMPLETE':
        console.log('Reload complete!');
        break;
      
      case 'PONG':
        // Handle ping/pong for latency measurement
        break;
    }
  }

  handleShotFired(message) {
    if (message.hit) {
      console.log(`[HIT] ${message.shooterId} shot ${message.targetId}`);
    }
  }

  handlePlayerKilled(message) {
    console.log(`[KILL] ${message.killerTeam} player killed another player`);
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendPlayerMove(position, rotation) {
    this.sendMessage({
      type: 'PLAYER_MOVE',
      position,
      rotation
    });
  }

  sendShot(origin, direction) {
    this.sendMessage({
      type: 'PLAYER_SHOOT',
      origin,
      direction
    });
  }

  sendInput(input) {
    this.sendMessage({
      type: 'PLAYER_INPUT',
      input
    });
  }

  onClose() {
    console.log('Disconnected from server');
    this.scheduleReconnect();
  }

  onError(error) {
    console.error('WebSocket error:', error);
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})...`);
      setTimeout(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}`;
        this.connect(url);
      }, this.reconnectDelay);
    }
  }
}
