using Microsoft.AspNetCore.Mvc;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Services;
using Microsoft.AspNetCore.SignalR;
using HackathonGame.ScoresService.Hubs;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/scores")]
public class ScoresController : ControllerBase
{
    private readonly IScoresService _scoresService;
    private readonly IHubContext<LeaderboardHub> _hubContext;

    public ScoresController(IScoresService scoresService, IHubContext<LeaderboardHub> hubContext)
    {
        _scoresService = scoresService;
        _hubContext    = hubContext;
    }

    // GET /api/scores/{sessionId} — Leaderboard
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<ScoreResponse>>> GetLeaderboard(string sessionId)
    {
        var scores = await _scoresService.GetLeaderboardAsync(sessionId);
        return Ok(scores);
    }

    // GET /api/scores/{sessionId}/team/{teamId} — Team score
    [HttpGet("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<ScoreResponse>> GetTeamScore(string sessionId, long teamId)
    {
        var score = await _scoresService.GetTeamScoreAsync(sessionId, teamId);
        return Ok(score);
    }

    // POST /api/scores/{sessionId}/team/{teamId} — Add/subtract points
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<ScoreResponse>> AddScore(string sessionId, long teamId, [FromBody] AddScoreRequest request)
    {
        var responseScore = await _scoresService.AddScoreAsync(sessionId, teamId, request);

        // SignalR broadcast залишається в контролері — це зовнішня комунікація, не бізнес-логіка
        await _hubContext.Clients.Group(sessionId).SendAsync("ReceiveScoreUpdate", responseScore);

        return Ok(responseScore);
    }

    // GET /api/scores/{sessionId}/history — All score history
    [HttpGet("{sessionId}/history")]
    public async Task<ActionResult<List<ScoreHistoryResponse>>> GetSessionHistory(string sessionId)
    {
        var history = await _scoresService.GetSessionHistoryAsync(sessionId);
        return Ok(history);
    }

    // GET /api/scores/{sessionId}/team/{teamId}/history — Team history
    [HttpGet("{sessionId}/team/{teamId}/history")]
    public async Task<ActionResult<List<ScoreHistoryResponse>>> GetTeamHistory(string sessionId, long teamId)
    {
        var history = await _scoresService.GetTeamHistoryAsync(sessionId, teamId);
        return Ok(history);
    }
}
