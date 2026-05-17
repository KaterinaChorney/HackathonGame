namespace HackathonGame.ScoresService.Services;

public interface ICardsIntegrationService
{
    Task SendFeedbackAsync(string sessionId, long teamId, string cardId, int round, int pointsAwarded, string reason);
}
