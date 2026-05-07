using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.Models;
using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/forms")]
public class FormsController : ControllerBase
{
    private readonly ScoresDbContext _db;
    public FormsController(ScoresDbContext db) => _db = db;

    // POST /api/forms/{sessionId}/team/{teamId} — Save form
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<FormResponse>> SaveForm(string sessionId, long teamId, [FromBody] SaveFormRequest request)
    {
        var existing = await _db.Forms
            .FirstOrDefaultAsync(f => f.SessionId == sessionId && f.TeamId == teamId && f.FormType == request.FormType);

        if (existing != null)
        {
            existing.Data = request.Data;
            existing.Round = request.Round;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(MapForm(existing));
        }

        var form = new Form
        {
            SessionId = sessionId,
            TeamId = teamId,
            FormType = request.FormType,
            Data = request.Data,
            Round = request.Round,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Forms.Add(form);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTeamForms), new { sessionId, teamId }, MapForm(form));
    }

    // GET /api/forms/{sessionId}/team/{teamId} — Get team forms
    [HttpGet("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<List<FormResponse>>> GetTeamForms(string sessionId, long teamId)
    {
        var forms = await _db.Forms
            .Where(f => f.SessionId == sessionId && f.TeamId == teamId)
            .OrderBy(f => f.FormType)
            .ToListAsync();

        return Ok(forms.Select(MapForm));
    }

    // GET /api/forms/{sessionId}/team/{teamId}/{type} — Get specific form
    [HttpGet("{sessionId}/team/{teamId}/{type}")]
    public async Task<ActionResult<FormResponse>> GetForm(string sessionId, long teamId, string type)
    {
        var form = await _db.Forms
            .FirstOrDefaultAsync(f => f.SessionId == sessionId && f.TeamId == teamId && f.FormType == type);

        if (form == null) return NotFound();
        return Ok(MapForm(form));
    }

    // PUT /api/forms/{id} — Update form
    [HttpPut("{id}")]
    public async Task<ActionResult<FormResponse>> UpdateForm(long id, [FromBody] UpdateFormRequest request)
    {
        var form = await _db.Forms.FindAsync(id);
        if (form == null) return NotFound();

        form.Data = request.Data;
        form.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapForm(form));
    }

    // GET /api/forms/{sessionId} — All session forms
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<FormResponse>>> GetSessionForms(string sessionId)
    {
        var forms = await _db.Forms
            .Where(f => f.SessionId == sessionId)
            .OrderBy(f => f.TeamId)
            .ThenBy(f => f.FormType)
            .ToListAsync();

        return Ok(forms.Select(MapForm));
    }

    private static FormResponse MapForm(Form f) => new()
    {
        Id = f.Id,
        SessionId = f.SessionId,
        TeamId = f.TeamId,
        FormType = f.FormType,
        Data = f.Data,
        Round = f.Round,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };
}
