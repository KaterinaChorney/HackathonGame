using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonGame.ScoresService.Models;

[Table("badges")]
public class Badge
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

    [Required]
    [MaxLength(50)]
    [Column("badge_type")]
    public string BadgeType { get; set; } = "";

    [Column("bonus_points")]
    public int BonusPoints { get; set; }

    [Column("awarded_at")]
    public DateTime AwardedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("TeamId")]
    public Score? Score { get; set; }
}
