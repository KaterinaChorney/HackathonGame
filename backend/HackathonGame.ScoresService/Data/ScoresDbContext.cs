using Microsoft.EntityFrameworkCore;
using HackathonGame.ScoresService.Models;

namespace HackathonGame.ScoresService.Data;

public class ScoresDbContext : DbContext
{
    public ScoresDbContext(DbContextOptions<ScoresDbContext> options) : base(options) { }

    public DbSet<Score> Scores => Set<Score>();
    public DbSet<ScoreHistory> ScoreHistory => Set<ScoreHistory>();
    public DbSet<Form> Forms => Set<Form>();
    public DbSet<Badge> Badges => Set<Badge>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Score>(e =>
        {
            e.HasIndex(s => new { s.SessionId, s.TeamId }).IsUnique();
            e.HasMany(s => s.History)
             .WithOne(h => h.Score)
             .HasForeignKey(h => h.ScoreId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Badge>(e =>
        {
            e.HasOne(b => b.Score)
             .WithMany(s => s.Badges)
             .HasForeignKey(b => b.TeamId)
             .HasPrincipalKey(s => s.TeamId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Form>(e =>
        {
            e.HasIndex(f => new { f.SessionId, f.TeamId, f.FormType }).IsUnique();
        });
    }
}
