using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Data;
using FluentValidation;
using FluentValidation.AspNetCore;
using HackathonGame.ScoresService.Services;
using HackathonGame.ScoresService.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ScoresDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Services
builder.Services.AddHttpClient<ICardsIntegrationService, CardsIntegrationService>(client =>
{
    var baseUrl = builder.Configuration.GetValue<string>("CardsService:BaseUrl");
    if (!string.IsNullOrEmpty(baseUrl))
    {
        client.BaseAddress = new Uri(baseUrl);
    }
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Scores & Forms Service API", Version = "v1" });
});

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<HackathonGame.ScoresService.Middleware.ExceptionHandlingMiddleware>();
app.UseCors("AllowFrontend");
app.UseMiddleware<HackathonGame.ScoresService.Middleware.AdminAuthMiddleware>();
app.MapControllers();
app.MapHub<LeaderboardHub>("/hubs/leaderboard");

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ScoresDbContext>();
    db.Database.Migrate();
}

app.Run();
