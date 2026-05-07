namespace HackathonGame.ScoresService.DTOs;

public class ScoreResponse
{
    public long Id { get; set; }
    public string SessionId { get; set; } = "";
    public long TeamId { get; set; }
    public int TotalScore { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<BadgeResponse> Badges { get; set; } = new();
}

public class ScoreHistoryResponse
{
    public long Id { get; set; }
    public long TeamId { get; set; }
    public int Round { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; } = "";
    public string? CardId { get; set; }
    public string CreatedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class AddScoreRequest
{
    public int Round { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; } = "";
    public string? CardId { get; set; }
    public string CreatedBy { get; set; } = "admin";
}

public class FormResponse
{
    public long Id { get; set; }
    public string SessionId { get; set; } = "";
    public long TeamId { get; set; }
    public string FormType { get; set; } = "";
    public string Data { get; set; } = "{}";
    public int Round { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveFormRequest
{
    public string FormType { get; set; } = "";
    public string Data { get; set; } = "{}";
    public int Round { get; set; }
}

public class UpdateFormRequest
{
    public string Data { get; set; } = "{}";
}

public class BadgeResponse
{
    public long Id { get; set; }
    public string SessionId { get; set; } = "";
    public long TeamId { get; set; }
    public string BadgeType { get; set; } = "";
    public int BonusPoints { get; set; }
    public DateTime AwardedAt { get; set; }
}

public class AwardBadgeRequest
{
    public string BadgeType { get; set; } = "";
    public int BonusPoints { get; set; }
}

public class BadgeTypeInfo
{
    public string Type { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "";
    public int DefaultPoints { get; set; }
}
