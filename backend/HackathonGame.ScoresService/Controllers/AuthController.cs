using Microsoft.AspNetCore.Mvc;

namespace HackathonGame.ScoresService.Controllers;

public class LoginRequest
{
    public string Password { get; set; } = "";
}

public class LoginResponse
{
    public string Token { get; set; } = "";
}

public static class SessionTokenManager
{
    private static readonly HashSet<string> ValidTokens = new();

    public static string GenerateToken()
    {
        var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        lock (ValidTokens)
        {
            ValidTokens.Add(token);
        }
        return token;
    }

    public static bool IsTokenValid(string token)
    {
        if (string.IsNullOrEmpty(token)) return false;
        lock (ValidTokens)
        {
            return ValidTokens.Contains(token);
        }
    }
    
    public static void RemoveToken(string token)
    {
        if (string.IsNullOrEmpty(token)) return;
        lock (ValidTokens)
        {
            ValidTokens.Remove(token);
        }
    }
}

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var adminPassword = _config.GetValue<string>("Admin:Password") ?? "admin";
        if (request.Password == adminPassword)
        {
            var token = SessionTokenManager.GenerateToken();
            return Ok(new LoginResponse { Token = token });
        }

        return Unauthorized(new { message = "Невірний пароль адміністратора" });
    }

    [HttpPost("logout")]
    public IActionResult Logout([FromHeader(Name = "Authorization")] string? authHeader)
    {
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader.Substring(7);
            SessionTokenManager.RemoveToken(token);
        }
        return Ok();
    }
}
