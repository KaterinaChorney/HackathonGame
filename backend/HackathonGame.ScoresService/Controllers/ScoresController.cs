using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.Models;
using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/scores")]
public class ScoresController : ControllerBase
{
    private readonly ScoresDbContext _db;
    public ScoresController(ScoresDbContext db) => _db = db;

    // GET /api/scores/{sessionId} — Leaderboard
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<ScoreResponse>>> GetLeaderboard(string sessionId)
    {
        var scores = await _db.Scores
            .Include(s => s.Badges)
            .Where(s => s.SessionId == sessionId)
            .OrderByDescending(s => s.TotalScore)
            .ToListAsync();

        return Ok(scores.Select(MapScore));
    }

    // GET /api/scores/{sessionId}/team/{teamId} — Team score
    [HttpGet("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<ScoreResponse>> GetTeamScore(string sessionId, long teamId)
    {
        var score = await _db.Scores
            .Include(s => s.Badges)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null)
            return Ok(new ScoreResponse { SessionId = sessionId, TeamId = teamId, TotalScore = 0 });

        return Ok(MapScore(score));
    }

    // POST /api/scores/{sessionId}/team/{teamId} — Add/subtract points
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<ScoreResponse>> AddScore(string sessionId, long teamId, [FromBody] AddScoreRequest request)
    {
        var score = await _db.Scores
            .Include(s => s.Badges)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null)
        {
            score = new Score { SessionId = sessionId, TeamId = teamId, TotalScore = 0 };
            _db.Scores.Add(score);
            await _db.SaveChangesAsync();
        }

        var history = new ScoreHistory
        {
            ScoreId = score.Id,
            Round = request.Round,
            Points = request.Points,
            Reason = request.Reason,
            CardId = request.CardId,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };
        _db.ScoreHistory.Add(history);

        score.TotalScore += request.Points;
        score.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapScore(score));
    }

    // GET /api/scores/{sessionId}/history — All score history
    [HttpGet("{sessionId}/history")]
    public async Task<ActionResult<List<ScoreHistoryResponse>>> GetSessionHistory(string sessionId)
    {
        var history = await _db.ScoreHistory
            .Include(h => h.Score)
            .Where(h => h.Score != null && h.Score.SessionId == sessionId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return Ok(history.Select(h => new ScoreHistoryResponse
        {
            Id = h.Id,
            TeamId = h.Score!.TeamId,
            Round = h.Round,
            Points = h.Points,
            Reason = h.Reason,
            CardId = h.CardId,
            CreatedBy = h.CreatedBy,
            CreatedAt = h.CreatedAt
        }));
    }

    // GET /api/scores/{sessionId}/team/{teamId}/history — Team history
    [HttpGet("{sessionId}/team/{teamId}/history")]
    public async Task<ActionResult<List<ScoreHistoryResponse>>> GetTeamHistory(string sessionId, long teamId)
    {
        var history = await _db.ScoreHistory
            .Include(h => h.Score)
            .Where(h => h.Score != null && h.Score.SessionId == sessionId && h.Score.TeamId == teamId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return Ok(history.Select(h => new ScoreHistoryResponse
        {
            Id = h.Id,
            TeamId = h.Score!.TeamId,
            Round = h.Round,
            Points = h.Points,
            Reason = h.Reason,
            CardId = h.CardId,
            CreatedBy = h.CreatedBy,
            CreatedAt = h.CreatedAt
        }));
    }

    private static ScoreResponse MapScore(Score s) => new()
    {
        Id = s.Id,
        SessionId = s.SessionId,
        TeamId = s.TeamId,
        TotalScore = s.TotalScore,
        UpdatedAt = s.UpdatedAt,
        Badges = s.Badges.Select(b => new BadgeResponse
        {
            Id = b.Id,
            SessionId = b.SessionId,
            TeamId = b.TeamId,
            BadgeType = b.BadgeType,
            BonusPoints = b.BonusPoints,
            AwardedAt = b.AwardedAt
        }).ToList()
    };
}
