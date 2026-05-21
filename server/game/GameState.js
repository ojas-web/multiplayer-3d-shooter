class GameState {
  constructor() {
    this.gameMode = 'TEAM_DEATHMATCH';
    this.roundTime = 600000; // 10 minutes in ms
    this.roundStartTime = Date.now();
    this.roundEndTime = this.roundStartTime + this.roundTime;
    this.isRoundActive = true;
    this.redTeamKills = 0;
    this.blueTeamKills = 0;
  }

  getRoundTimeRemaining() {
    const remaining = this.roundEndTime - Date.now();
    return Math.max(0, remaining);
  }

  isRoundOver() {
    return this.getRoundTimeRemaining() <= 0;
  }

  endRound() {
    this.isRoundActive = false;
  }

  startNewRound() {
    this.roundStartTime = Date.now();
    this.roundEndTime = this.roundStartTime + this.roundTime;
    this.isRoundActive = true;
  }

  getState() {
    return {
      gameMode: this.gameMode,
      isRoundActive: this.isRoundActive,
      timeRemaining: this.getRoundTimeRemaining(),
      redTeamKills: this.redTeamKills,
      blueTeamKills: this.blueTeamKills
    };
  }
}

module.exports = GameState;
