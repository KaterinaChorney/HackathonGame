namespace HackathonGame.ScoresService.Services;

public interface IExportService
{
    Task<byte[]> ExportHistoryCsvAsync(string sessionId);
    Task<byte[]> ExportLeaderboardCsvAsync(string sessionId);
}
