using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using System.Text;

namespace HackathonGame.ScoresService.Services;

public class ExportService : IExportService
{
    private readonly ScoresDbContext _db;

    public ExportService(ScoresDbContext db) => _db = db;

    public async Task<byte[]> ExportHistoryCsvAsync(string sessionId)
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

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<byte[]> ExportLeaderboardCsvAsync(string sessionId)
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

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
