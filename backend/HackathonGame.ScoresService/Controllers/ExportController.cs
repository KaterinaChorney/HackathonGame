using Microsoft.AspNetCore.Mvc;
using HackathonGame.ScoresService.Services;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService) => _exportService = exportService;

    // GET /api/export/{sessionId}/history/csv — Export score history as CSV
    [HttpGet("{sessionId}/history/csv")]
    public async Task<IActionResult> ExportHistoryCsv(string sessionId)
    {
        var bytes = await _exportService.ExportHistoryCsvAsync(sessionId);
        return File(bytes, "text/csv", $"scores_{sessionId}.csv");
    }

    // GET /api/export/{sessionId}/leaderboard/csv — Leaderboard as CSV
    [HttpGet("{sessionId}/leaderboard/csv")]
    public async Task<IActionResult> ExportLeaderboardCsv(string sessionId)
    {
        var bytes = await _exportService.ExportLeaderboardCsvAsync(sessionId);
        return File(bytes, "text/csv", $"leaderboard_{sessionId}.csv");
    }
}
