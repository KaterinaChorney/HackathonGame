using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Text.Json;
using HackathonGame.ScoresService.Controllers;

namespace HackathonGame.ScoresService.Middleware;

public class AdminAuthMiddleware
{
    private readonly RequestDelegate _next;

    public AdminAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;

        // Protect write endpoints
        bool isProtectedEndpoint = (method == "POST" && 
                                    (path.StartsWith("/api/scores", System.StringComparison.OrdinalIgnoreCase) || 
                                     path.StartsWith("/api/badges", System.StringComparison.OrdinalIgnoreCase)));

        if (isProtectedEndpoint)
        {
            var authHeader = context.Request.Headers["Authorization"].ToString();
            string? token = null;

            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", System.StringComparison.OrdinalIgnoreCase))
            {
                token = authHeader.Substring(7);
            }

            if (string.IsNullOrEmpty(token) || !SessionTokenManager.IsTokenValid(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                
                var errorResponse = new { message = "Необхідна авторизація адміністратора" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                return;
            }
        }

        await _next(context);
    }
}
