using System.Net.Http.Json;
using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Services;

public class CardsIntegrationService : ICardsIntegrationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CardsIntegrationService> _logger;

    public CardsIntegrationService(HttpClient httpClient, ILogger<CardsIntegrationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SendFeedbackAsync(string sessionId, long teamId, string cardId, int round, int pointsAwarded, string reason)
    {
        try
        {
            var request = new CardFeedbackRequest
            {
                SessionId = sessionId,
                TeamId = teamId,
                CardId = cardId,
                Round = round,
                PointsAwarded = pointsAwarded,
                Reason = reason
            };

            var response = await _httpClient.PostAsJsonAsync("/api/cards/feedback", request);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully sent card feedback to CardsService for CardId: {CardId}", cardId);
            }
            else
            {
                _logger.LogWarning("Failed to send card feedback to CardsService. StatusCode: {StatusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while sending card feedback to CardsService.");
        }
    }
}
