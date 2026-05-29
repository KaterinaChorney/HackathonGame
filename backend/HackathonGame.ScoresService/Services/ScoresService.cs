using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Models;

namespace HackathonGame.ScoresService.Services;

public class ScoresService : IScoresService
{
    private readonly ScoresDbContext _db;
    private readonly ICardsIntegrationService _cardsIntegrationService;
    private readonly ILogger<ScoresService> _logger;

    public ScoresService(
        ScoresDbContext db,
        ICardsIntegrationService cardsIntegrationService,
        ILogger<ScoresService> logger)
    {
        _db = db;
        _cardsIntegrationService = cardsIntegrationService;
        _logger = logger;
    }

    public async Task<List<ScoreResponse>> GetLeaderboardAsync(string sessionId)
    {
        var scores = await _db.Scores
            .Include(s => s.Badges)
            .Where(s => s.SessionId == sessionId)
            .OrderByDescending(s => s.TotalScore)
            .ToListAsync();

        return scores.Select(MapScore).ToList();
    }

    public async Task<ScoreResponse> GetTeamScoreAsync(string sessionId, long teamId)
    {
        var score = await _db.Scores
            .Include(s => s.Badges)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TeamId == teamId);

        if (score == null)
            return new ScoreResponse { SessionId = sessionId, TeamId = teamId, TotalScore = 0 };

        return MapScore(score);
    }

    public async Task<ScoreResponse> AddScoreAsync(string sessionId, long teamId, AddScoreRequest request)
    {
        var score = await _db.Scores
            .Include(s => s.Badges)
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
                // Паралельний запит вже створив цей запис — читаємо його
                _logger.LogWarning("Race condition detected on Score creation for session={SessionId}, team={TeamId}. Fetching existing record.", sessionId, teamId);
                _db.ChangeTracker.Clear();
                score = await _db.Scores
                    .Include(s => s.Badges)
                    .FirstAsync(s => s.SessionId == sessionId && s.TeamId == teamId);
            }
        }

        var history = new ScoreHistory
        {
            ScoreId   = score.Id,
            Round     = request.Round,
            Points    = request.Points,
            Reason    = request.Reason,
            CardId    = request.CardId,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };
        _db.ScoreHistory.Add(history);

        score.TotalScore += request.Points;
        score.UpdatedAt   = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(request.CardId))
        {
            await _cardsIntegrationService.SendFeedbackAsync(
                sessionId, teamId, request.CardId,
                request.Round, request.Points, request.Reason);
        }

        return MapScore(score);
    }

    public async Task<List<ScoreHistoryResponse>> GetSessionHistoryAsync(string sessionId)
    {
        var history = await _db.ScoreHistory
            .Include(h => h.Score)
            .Where(h => h.Score != null && h.Score.SessionId == sessionId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return history.Select(MapHistory).ToList();
    }

    public async Task<List<ScoreHistoryResponse>> GetTeamHistoryAsync(string sessionId, long teamId)
    {
        var history = await _db.ScoreHistory
            .Include(h => h.Score)
            .Where(h => h.Score != null && h.Score.SessionId == sessionId && h.Score.TeamId == teamId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return history.Select(MapHistory).ToList();
    }

    public static ScoreResponse MapScore(Score s) => new()
    {
        Id         = s.Id,
        SessionId  = s.SessionId,
        TeamId     = s.TeamId,
        TotalScore = s.TotalScore,
        UpdatedAt  = s.UpdatedAt,
        Badges     = s.Badges.Select(b => new BadgeResponse
        {
            Id          = b.Id,
            SessionId   = b.SessionId,
            TeamId      = b.TeamId,
            BadgeType   = b.BadgeType,
            BonusPoints = b.BonusPoints,
            AwardedAt   = b.AwardedAt
        }).ToList()
    };

    private static ScoreHistoryResponse MapHistory(ScoreHistory h) => new()
    {
        Id        = h.Id,
        TeamId    = h.Score!.TeamId,
        Round     = h.Round,
        Points    = h.Points,
        Reason    = h.Reason,
        CardId    = h.CardId,
        CreatedBy = h.CreatedBy,
        CreatedAt = h.CreatedAt
    };
}
