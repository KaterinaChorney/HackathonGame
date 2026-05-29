using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Models;

namespace HackathonGame.ScoresService.Services;

public class FormsService : IFormsService
{
    private readonly ScoresDbContext _db;
    private readonly ILogger<FormsService> _logger;

    public FormsService(ScoresDbContext db, ILogger<FormsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<FormResponse> SaveFormAsync(string sessionId, long teamId, SaveFormRequest request)
    {
        var existing = await _db.Forms
            .FirstOrDefaultAsync(f => f.SessionId == sessionId
                                   && f.TeamId == teamId
                                   && f.FormType == request.FormType);

        if (existing != null)
        {
            existing.Data      = request.Data;
            existing.Round     = request.Round;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return MapForm(existing);
        }

        var form = new Form
        {
            SessionId = sessionId,
            TeamId    = teamId,
            FormType  = request.FormType,
            Data      = request.Data,
            Round     = request.Round,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Forms.Add(form);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException?.Message.Contains("unique") == true
               || ex.InnerException?.Message.Contains("duplicate") == true
               || ex.InnerException?.Message.Contains("23505") == true)
        {
            // Паралельний запит вже створив форму — оновлюємо існуючу
            _logger.LogWarning("Race condition detected on Form creation for session={SessionId}, team={TeamId}, type={FormType}.", sessionId, teamId, request.FormType);
            _db.ChangeTracker.Clear();
            var conflict = await _db.Forms
                .FirstAsync(f => f.SessionId == sessionId
                              && f.TeamId == teamId
                              && f.FormType == request.FormType);
            conflict.Data      = request.Data;
            conflict.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return MapForm(conflict);
        }

        return MapForm(form);
    }

    public async Task<List<FormResponse>> GetTeamFormsAsync(string sessionId, long teamId)
    {
        var forms = await _db.Forms
            .Where(f => f.SessionId == sessionId && f.TeamId == teamId)
            .OrderBy(f => f.FormType)
            .ToListAsync();

        return forms.Select(MapForm).ToList();
    }

    public async Task<FormResponse?> GetFormAsync(string sessionId, long teamId, string formType)
    {
        var form = await _db.Forms
            .FirstOrDefaultAsync(f => f.SessionId == sessionId
                                   && f.TeamId == teamId
                                   && f.FormType == formType);

        return form == null ? null : MapForm(form);
    }

    public async Task<FormResponse?> UpdateFormAsync(long id, UpdateFormRequest request)
    {
        var form = await _db.Forms.FindAsync(id);
        if (form == null) return null;

        form.Data      = request.Data;
        form.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapForm(form);
    }

    public async Task<List<FormResponse>> GetSessionFormsAsync(string sessionId)
    {
        var forms = await _db.Forms
            .Where(f => f.SessionId == sessionId)
            .OrderBy(f => f.TeamId)
            .ThenBy(f => f.FormType)
            .ToListAsync();

        return forms.Select(MapForm).ToList();
    }

    private static FormResponse MapForm(Form f) => new()
    {
        Id        = f.Id,
        SessionId = f.SessionId,
        TeamId    = f.TeamId,
        FormType  = f.FormType,
        Data      = f.Data,
        Round     = f.Round,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };
}
