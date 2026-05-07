using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackathonGame.ScoresService.Models;

[Table("forms")]
public class Form
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
    [Column("form_type")]
    public string FormType { get; set; } = "";

    [Column("data", TypeName = "jsonb")]
    public string Data { get; set; } = "{}";

    [Column("round")]
    public int Round { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
