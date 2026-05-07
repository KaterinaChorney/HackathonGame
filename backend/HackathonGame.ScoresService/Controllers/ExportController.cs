using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using System.Text;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ScoresDbContext _db;
    public ExportController(ScoresDbContext db) => _db = db;

    // GET /api/export/{sessionId}/history/csv — Export score history as CSV
    [HttpGet("{sessionId}/history/csv")]
    public async Task<IActionResult> ExportHistoryCsv(string sessionId)
    {
        var history = await _db.ScoreHistory
            .Include(h => h.Score)
            .Where(h => h.Score != null && h.Score.SessionId == sessionId)
            .OrderBy(h => h.CreatedAt)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("\uFEFF\"Team ID\",\"Round\",\"Points\",\"Reason\",\"Card ID\",\"Created By\",\"Created At\"");
        foreach (var h in history)
        {
            sb.AppendLine($"\"{h.Score!.TeamId}\",\"{h.Round}\",\"{h.Points}\",\"{h.Reason}\",\"{h.CardId ?? ""}\",\"{h.CreatedBy}\",\"{h.CreatedAt:yyyy-MM-dd HH:mm:ss}\"");
        }

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"scores_{sessionId}.csv");
    }

    // GET /api/export/{sessionId}/leaderboard/csv — Leaderboard as CSV
    [HttpGet("{sessionId}/leaderboard/csv")]
    public async Task<IActionResult> ExportLeaderboardCsv(string sessionId)
    {
        var scores = await _db.Scores
            .Include(s => s.Badges)
            .Where(s => s.SessionId == sessionId)
            .OrderByDescending(s => s.TotalScore)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("\uFEFF\"Rank\",\"Team ID\",\"Total Score\",\"Badges\"");
        int rank = 1;
        foreach (var s in scores)
        {
            var badges = string.Join("; ", s.Badges.Select(b => b.BadgeType));
            sb.AppendLine($"\"{rank++}\",\"{s.TeamId}\",\"{s.TotalScore}\",\"{badges}\"");
        }

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"leaderboard_{sessionId}.csv");
    }
}
