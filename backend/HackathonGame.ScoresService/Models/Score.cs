using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonGame.ScoresService.Models;

[Table("scores")]
public class Score
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [MaxLength(6)]
    [Column("session_id")]
    public string SessionId { get; set; } = "";

    [Column("team_id")]
    public long TeamId { get; set; }

    [Column("total_score")]
    public int TotalScore { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<ScoreHistory> History { get; set; } = new();
    public List<Badge> Badges { get; set; } = new();
}
