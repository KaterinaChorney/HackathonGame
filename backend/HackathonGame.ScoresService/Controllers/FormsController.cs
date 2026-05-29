using Microsoft.AspNetCore.Mvc;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Services;

namespace HackathonGame.ScoresService.Controllers;

[ApiController]
[Route("api/forms")]
public class FormsController : ControllerBase
{
    private readonly IFormsService _formsService;

    public FormsController(IFormsService formsService) => _formsService = formsService;

    // POST /api/forms/{sessionId}/team/{teamId} — Save form
    [HttpPost("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<FormResponse>> SaveForm(string sessionId, long teamId, [FromBody] SaveFormRequest request)
    {
        var form = await _formsService.SaveFormAsync(sessionId, teamId, request);
        return Ok(form);
    }

    // GET /api/forms/{sessionId}/team/{teamId} — Get team forms
    [HttpGet("{sessionId}/team/{teamId}")]
    public async Task<ActionResult<List<FormResponse>>> GetTeamForms(string sessionId, long teamId)
    {
        var forms = await _formsService.GetTeamFormsAsync(sessionId, teamId);
        return Ok(forms);
    }

    // GET /api/forms/{sessionId}/team/{teamId}/{type} — Get specific form
    [HttpGet("{sessionId}/team/{teamId}/{type}")]
    public async Task<ActionResult<FormResponse>> GetForm(string sessionId, long teamId, string type)
    {
        var form = await _formsService.GetFormAsync(sessionId, teamId, type);
        if (form == null) return NotFound();
        return Ok(form);
    }

    // PUT /api/forms/{id} — Update form
    [HttpPut("{id}")]
    public async Task<ActionResult<FormResponse>> UpdateForm(long id, [FromBody] UpdateFormRequest request)
    {
        var form = await _formsService.UpdateFormAsync(id, request);
        if (form == null) return NotFound();
        return Ok(form);
    }

    // GET /api/forms/{sessionId} — All session forms
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<List<FormResponse>>> GetSessionForms(string sessionId)
    {
        var forms = await _formsService.GetSessionFormsAsync(sessionId);
        return Ok(forms);
    }
}
