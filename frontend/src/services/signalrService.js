import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = [];
  }

  startConnection(sessionId) {
    if (this.connection) {
      this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/leaderboard')
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveScoreUpdate', (score) => {
      this.callbacks.forEach(cb => cb(score));
    });

    this.connection.start()
      .then(() => {
        console.log('SignalR Connected.');
        this.connection.invoke('JoinSession', sessionId);
      })
      .catch(err => console.error('SignalR Connection Error: ', err));
  }

  onScoreUpdate(callback) {
    this.callbacks.push(callback);
  }

  offScoreUpdate(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

const signalrService = new SignalRService();
export default signalrService;
