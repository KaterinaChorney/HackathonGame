using Microsoft.AspNetCore.Mvc;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Services;
using Microsoft.AspNetCore.SignalR;
using HackathonGame.ScoresService.Hubs;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/badges")]
public class BadgesController : ControllerBase
{
    private readonly IBadgesService _badgesService;
    private readonly IHubContext<LeaderboardHub> _hubContext;

    public BadgesController(IBadgesService badgesService, IHubContext<LeaderboardHub> hubContext)
    {
        _badgesService = badgesService;
        _hubContext    = hubContext;
    }

    // GET /api/badges/types — Badge types list
    [HttpGet("types")]
    public ActionResult<List<BadgeTypeInfo>> GetBadgeTypes()
    {
        return Ok(_badgesService.GetBadgeTypes());
    }

    // GET /api/badges/{sessionId} — All session badges
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<BadgeResponse>>> GetSessionBadges(string sessionId)
    {
        var badges = await _badgesService.GetSessionBadgesAsync(sessionId);
        return Ok(badges);
    }

    // POST /api/badges/{sessionId}/team/{teamId} — Award badge
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<BadgeResponse>> AwardBadge(string sessionId, long teamId, [FromBody] AwardBadgeRequest request)
    {
        var badge = await _badgesService.AwardBadgeAsync(sessionId, teamId, request);

        // Після видачі бейджу — отримуємо оновлений стан рахунку для SignalR broadcast
        var updatedScore = await _badgesService.GetScoreWithBadgesAsync(sessionId, teamId);
        if (updatedScore != null)
        {
            await _hubContext.Clients.Group(sessionId).SendAsync("ReceiveScoreUpdate", updatedScore);
        }

        return Ok(badge);
    }
}
