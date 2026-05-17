using Microsoft.AspNetCore.SignalR;

namespace HackathonGame.ScoresService.Hubs;

public class LeaderboardHub : Hub
{
    // Clients can call this to join a specific session's group
    public async Task JoinSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
    }

    // Clients can call this to leave a specific session's group
    public async Task LeaveSession(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
    }
}
