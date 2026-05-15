using FluentValidation;
using HackathonGame.ScoresService.DTOs;

namespace HackathonGame.ScoresService.Validators;

public class AddScoreRequestValidator : AbstractValidator<AddScoreRequest>
{
    public AddScoreRequestValidator()
    {
        RuleFor(x => x.Round)
            .GreaterThanOrEqualTo(0).WithMessage("Round must be greater than or equal to 0.");

        RuleFor(x => x.Points)
            .NotEqual(0).WithMessage("Points must not be zero.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required.");
    }
}
