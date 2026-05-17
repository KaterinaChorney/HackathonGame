import * as signalR from '@microsoft/signalr';

class SessionHubService {
  constructor() {
    this.connection = null;
    this.timerCallbacks = [];
    this.roundStartedCallbacks = [];
    this.roundEndedCallbacks = [];
  }

  startConnection(sessionId) {
    if (this.connection) {
      this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:8081/hubs/session')
      .withAutomaticReconnect()
      .build();

    this.connection.on('TimerTick', (remaining, round) => {
      this.timerCallbacks.forEach(cb => cb({ remaining, round }));
    });

    this.connection.on('RoundStarted', (round, roundEndTime, durationMinutes) => {
      this.roundStartedCallbacks.forEach(cb => cb({ round, roundEndTime, durationMinutes }));
    });

    this.connection.on('RoundEnded', (round) => {
      this.roundEndedCallbacks.forEach(cb => cb({ round }));
    });

    this.connection.start()
      .then(() => {
        console.log('Connected to P1 Session Hub.');
        this.connection.invoke('JoinSession', sessionId).catch(err => console.error(err));
      })
      .catch(err => console.error('P1 Session Hub Connection Error: ', err));
  }

  onTimerTick(callback) { this.timerCallbacks.push(callback); }
  offTimerTick(callback) { this.timerCallbacks = this.timerCallbacks.filter(cb => cb !== callback); }

  onRoundStarted(callback) { this.roundStartedCallbacks.push(callback); }
  offRoundStarted(callback) { this.roundStartedCallbacks = this.roundStartedCallbacks.filter(cb => cb !== callback); }

  onRoundEnded(callback) { this.roundEndedCallbacks.push(callback); }
  offRoundEnded(callback) { this.roundEndedCallbacks = this.roundEndedCallbacks.filter(cb => cb !== callback); }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

const sessionHubService = new SessionHubService();
export default sessionHubService;
