using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using HackathonGame.ScoresService.Data;
using HackathonGame.ScoresService.Services;
using HackathonGame.ScoresService.DTOs;
using HackathonGame.ScoresService.Models;
using Xunit;

namespace HackathonGame.ScoresService.Tests;

public class ScoresServiceTests
{
    private ScoresDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ScoresDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        return new ScoresDbContext(options);
    }

    [Fact]
    public async Task AddScore_TwiceForSameTeam_ShouldSumPointsAndKeepOneRecord()
    {
        // Arrange
        var db = GetDbContext();
        var mockCardsService = new Mock<ICardsIntegrationService>();
        var mockLogger = new Mock<ILogger<HackathonGame.ScoresService.Services.ScoresService>>();

        var scoresService = new HackathonGame.ScoresService.Services.ScoresService(db, mockCardsService.Object, mockLogger.Object);

        string sessionId = "session_1";
        long teamId = 100;

        var request1 = new AddScoreRequest { Points = 10, Round = 1, Reason = "Task 1" };
        var request2 = new AddScoreRequest { Points = 25, Round = 2, Reason = "Task 2" };

        // Act - First addition
        await scoresService.AddScoreAsync(sessionId, teamId, request1);
        
        // Act - Second addition
        await scoresService.AddScoreAsync(sessionId, teamId, request2);

        // Assert
        var scoresInDb = await db.Scores.Where(s => s.SessionId == sessionId && s.TeamId == teamId).ToListAsync();
        
        // Має бути лише один запис у таблиці Scores
        Assert.Single(scoresInDb);
        
        // Загальна сума балів має дорівнювати сумі обох запитів (10 + 25 = 35)
        Assert.Equal(35, scoresInDb.First().TotalScore);
        
        // Історія має містити два записи
        var historyInDb = await db.ScoreHistory.Where(h => h.ScoreId == scoresInDb.First().Id).ToListAsync();
        Assert.Equal(2, historyInDb.Count);
    }
}
