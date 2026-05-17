namespace HackathonGame.ScoresService.DTOs;

public class CardFeedbackRequest
{
    public string SessionId { get; set; } = "";
    public long TeamId { get; set; }
    public string CardId { get; set; } = "";
    public int Round { get; set; }
    public int PointsAwarded { get; set; }
    public string Reason { get; set; } = "";
}
