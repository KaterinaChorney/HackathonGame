using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Models;

namespace HackathonGame.ScoresService.Services;

public interface IBadgesService
{
    List<BadgeTypeInfo> GetBadgeTypes();
    Task<List<BadgeResponse>> GetSessionBadgesAsync(string sessionId);
    Task<BadgeResponse> AwardBadgeAsync(string sessionId, long teamId, AwardBadgeRequest request);

    // Needed by ScoresService to build ScoreResponse with badges
    Task<ScoreResponse?> GetScoreWithBadgesAsync(string sessionId, long teamId);
}
