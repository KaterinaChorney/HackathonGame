using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Models;

namespace HackathonGame.ScoresService.Services;

public class BadgesService : IBadgesService
{
    private readonly ScoresDbContext _db;
    private readonly ILogger<BadgesService> _logger;

    private static readonly List<BadgeTypeInfo> BadgeTypes = new()
    {
        new() { Type = "innovator",     Name = "Інноватор",           Description = "За найкреативніше рішення",         Icon = "💡", DefaultPoints = 10 },
        new() { Type = "speedster",     Name = "Швидкий",             Description = "Перша команда що завершила раунд",   Icon = "⚡", DefaultPoints = 5  },
        new() { Type = "presenter",     Name = "Оратор",              Description = "За найкращу презентацію",            Icon = "🎤", DefaultPoints = 10 },
        new() { Type = "teamwork",      Name = "Командний гравець",   Description = "За найкращу командну роботу",        Icon = "🤝", DefaultPoints = 5  },
        new() { Type = "problem_solver",Name = "Проблемний вирішувач",Description = "За найкращий Problem Canvas",       Icon = "🧩", DefaultPoints = 10 },
        new() { Type = "creative",      Name = "Креативник",          Description = "За найкращі Crazy 8s ідеї",         Icon = "🎨", DefaultPoints = 10 },
        new() { Type = "survivor",      Name = "Виживач",             Description = "Зберегли всі токени життя",          Icon = "🛡️", DefaultPoints = 15 },
        new() { Type = "mvp",           Name = "MVP",                 Description = "Найцінніший гравець сесії",          Icon = "🏆", DefaultPoints = 20 }
    };

    public BadgesService(ScoresDbContext db, ILogger<BadgesService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public List<BadgeTypeInfo> GetBadgeTypes() => BadgeTypes;

    public async Task<List<BadgeResponse>> GetSessionBadgesAsync(string sessionId)
    {
        var badges = await _db.Badges
            .Where(b => b.SessionId == sessionId)
            .OrderByDescending(b => b.AwardedAt)
            .ToListAsync();

        return badges.Select(MapBadge).ToList();
    }

    public async Task<BadgeResponse> AwardBadgeAsync(string sessionId, long teamId, AwardBadgeRequest request)
    {
        var badgeType   = BadgeTypes.FirstOrDefault(bt => bt.Type == request.BadgeType);
        int bonusPoints = request.BonusPoints > 0 ? request.BonusPoints : (badgeType?.DefaultPoints ?? 5);

        var score = await _db.Scores
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null)
        {
            score = new Score { SessionId = sessionId, TeamId = teamId, TotalScore = 0 };
            _db.Scores.Add(score);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
                when (ex.InnerException?.Message.Contains("unique") == true
                   || ex.InnerException?.Message.Contains("duplicate") == true
                   || ex.InnerException?.Message.Contains("23505") == true)
            {
                _logger.LogWarning("Race condition detected on Score creation (badge) for session={SessionId}, team={TeamId}.", sessionId, teamId);
                _db.ChangeTracker.Clear();
                score = await _db.Scores
                    .FirstAsync(s => s.SessionId == sessionId && s.TeamId == teamId);
            }
        }

        var badge = new Badge
        {
            SessionId   = sessionId,
            TeamId      = teamId,
            BadgeType   = request.BadgeType,
            BonusPoints = bonusPoints,
            AwardedAt   = DateTime.UtcNow,
            ScoreId     = score.Id
        };
        _db.Badges.Add(badge);

        score.TotalScore += bonusPoints;
        score.UpdatedAt   = DateTime.UtcNow;

        var history = new ScoreHistory
        {
            ScoreId   = score.Id,
            Round     = 0,
            Points    = bonusPoints,
            Reason    = $"Бейдж: {badgeType?.Name ?? request.BadgeType}",
            CreatedBy = "admin",
            CreatedAt = DateTime.UtcNow
        };
        _db.ScoreHistory.Add(history);

        await _db.SaveChangesAsync();

        return MapBadge(badge);
    }

    public async Task<ScoreResponse?> GetScoreWithBadgesAsync(string sessionId, long teamId)
    {
        var score = await _db.Scores
            .Include(s => s.Badges)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null) return null;

        return ScoresService.MapScore(score);
    }

    private static BadgeResponse MapBadge(Badge b) => new()
    {
        Id          = b.Id,
        SessionId   = b.SessionId,
        TeamId      = b.TeamId,
        BadgeType   = b.BadgeType,
        BonusPoints = b.BonusPoints,
        AwardedAt   = b.AwardedAt
    };
}
