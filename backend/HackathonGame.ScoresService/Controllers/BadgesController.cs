using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.Models;
using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/badges")]
public class BadgesController : ControllerBase
{
    private readonly ScoresDbContext _db;
    public BadgesController(ScoresDbContext db) => _db = db;

    private static readonly List<BadgeTypeInfo> BadgeTypes = new()
    {
        new() { Type = "innovator", Name = "Інноватор", Description = "За найкреативніше рішення", Icon = "💡", DefaultPoints = 10 },
        new() { Type = "speedster", Name = "Швидкий", Description = "Перша команда що завершила раунд", Icon = "⚡", DefaultPoints = 5 },
        new() { Type = "presenter", Name = "Оратор", Description = "За найкращу презентацію", Icon = "🎤", DefaultPoints = 10 },
        new() { Type = "teamwork", Name = "Командний гравець", Description = "За найкращу командну роботу", Icon = "🤝", DefaultPoints = 5 },
        new() { Type = "problem_solver", Name = "Проблемний вирішувач", Description = "За найкращий Problem Canvas", Icon = "🧩", DefaultPoints = 10 },
        new() { Type = "creative", Name = "Креативник", Description = "За найкращі Crazy 8s ідеї", Icon = "🎨", DefaultPoints = 10 },
        new() { Type = "survivor", Name = "Виживач", Description = "Зберегли всі токени життя", Icon = "🛡️", DefaultPoints = 15 },
        new() { Type = "mvp", Name = "MVP", Description = "Найцінніший гравець сесії", Icon = "🏆", DefaultPoints = 20 }
    };

    // GET /api/badges/types — Badge types list
    [HttpGet("types")]
    public ActionResult<List<BadgeTypeInfo>> GetBadgeTypes()
    {
        return Ok(BadgeTypes);
    }

    // GET /api/badges/{sessionId} — All session badges
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<BadgeResponse>>> GetSessionBadges(string sessionId)
    {
        var badges = await _db.Badges
            .Where(b => b.SessionId == sessionId)
            .OrderByDescending(b => b.AwardedAt)
            .ToListAsync();

        return Ok(badges.Select(MapBadge));
    }

    // POST /api/badges/{sessionId}/team/{teamId} — Award badge
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<BadgeResponse>> AwardBadge(string sessionId, long teamId, [FromBody] AwardBadgeRequest request)
    {
        var badgeType = BadgeTypes.FirstOrDefault(bt => bt.Type == request.BadgeType);
        int bonusPoints = request.BonusPoints > 0 ? request.BonusPoints : (badgeType?.DefaultPoints ?? 5);

        var badge = new Badge
        {
            SessionId = sessionId,
            TeamId = teamId,
            BadgeType = request.BadgeType,
            BonusPoints = bonusPoints,
            AwardedAt = DateTime.UtcNow
        };
        _db.Badges.Add(badge);

        // Also add bonus points to score
        var score = await _db.Scores
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null)
        {
            score = new Score { SessionId = sessionId, TeamId = teamId, TotalScore = 0 };
            _db.Scores.Add(score);
            await _db.SaveChangesAsync();
        }

        score.TotalScore += bonusPoints;
        score.UpdatedAt = DateTime.UtcNow;

        var history = new ScoreHistory
        {
            ScoreId = score.Id,
            Round = 0,
            Points = bonusPoints,
            Reason = $"Бейдж: {badgeType?.Name ?? request.BadgeType}",
            CreatedBy = "admin",
            CreatedAt = DateTime.UtcNow
        };
        _db.ScoreHistory.Add(history);

        await _db.SaveChangesAsync();
        return Ok(MapBadge(badge));
    }

    private static BadgeResponse MapBadge(Badge b) => new()
    {
        Id = b.Id,
        SessionId = b.SessionId,
        TeamId = b.TeamId,
        BadgeType = b.BadgeType,
        BonusPoints = b.BonusPoints,
        AwardedAt = b.AwardedAt
    };
}
