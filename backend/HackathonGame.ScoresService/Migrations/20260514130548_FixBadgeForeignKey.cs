using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonGame.ScoresService.Migrations
{
    /// <inheritdoc />
    public partial class FixBadgeForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_badges_scores_team_id",
                table: "badges");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_scores_team_id",
                table: "scores");

            migrationBuilder.DropIndex(
                name: "IX_badges_team_id",
                table: "badges");

            migrationBuilder.AddColumn<long>(
                name: "score_id",
                table: "badges",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_badges_score_id",
                table: "badges",
                column: "score_id");

            migrationBuilder.AddForeignKey(
                name: "FK_badges_scores_score_id",
                table: "badges",
                column: "score_id",
                principalTable: "scores",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_badges_scores_score_id",
                table: "badges");

            migrationBuilder.DropIndex(
                name: "IX_badges_score_id",
                table: "badges");

            migrationBuilder.DropColumn(
                name: "score_id",
                table: "badges");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_scores_team_id",
                table: "scores",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "IX_badges_team_id",
                table: "badges",
                column: "team_id");

            migrationBuilder.AddForeignKey(
                name: "FK_badges_scores_team_id",
                table: "badges",
                column: "team_id",
                principalTable: "scores",
                principalColumn: "team_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
