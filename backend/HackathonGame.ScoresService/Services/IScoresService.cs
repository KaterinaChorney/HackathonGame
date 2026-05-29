using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Services;

public interface IScoresService
{
    Task<List<ScoreResponse>> GetLeaderboardAsync(string sessionId);
    Task<ScoreResponse> GetTeamScoreAsync(string sessionId, long teamId);
    Task<ScoreResponse> AddScoreAsync(string sessionId, long teamId, AddScoreRequest request);
    Task<List<ScoreHistoryResponse>> GetSessionHistoryAsync(string sessionId);
    Task<List<ScoreHistoryResponse>> GetTeamHistoryAsync(string sessionId, long teamId);
}
