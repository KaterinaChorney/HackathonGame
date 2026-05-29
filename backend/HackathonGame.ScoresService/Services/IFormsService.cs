using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Services;

public interface IFormsService
{
    Task<FormResponse> SaveFormAsync(string sessionId, long teamId, SaveFormRequest request);
    Task<List<FormResponse>> GetTeamFormsAsync(string sessionId, long teamId);
    Task<FormResponse?> GetFormAsync(string sessionId, long teamId, string formType);
    Task<FormResponse?> UpdateFormAsync(long id, UpdateFormRequest request);
    Task<List<FormResponse>> GetSessionFormsAsync(string sessionId);
}
