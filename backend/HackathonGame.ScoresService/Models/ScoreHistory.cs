using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonGame.ScoresService.Models;

[Table("score_history")]
public class ScoreHistory
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("score_id")]
    public long ScoreId { get; set; }

    [Column("round")]
    public int Round { get; set; }

    [Column("points")]
    public int Points { get; set; }

    [MaxLength(255)]
    [Column("reason")]
    public string Reason { get; set; } = "";

    [MaxLength(50)]
    [Column("card_id")]
    public string? CardId { get; set; }

    [MaxLength(50)]
    [Column("created_by")]
    public string CreatedBy { get; set; } = "admin";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ScoreId")]
    public Score? Score { get; set; }
}
