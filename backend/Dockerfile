FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY . .
RUN dotnet restore "HackathonGame.ScoresService/HackathonGame.ScoresService.csproj"
RUN dotnet publish "HackathonGame.ScoresService/HackathonGame.ScoresService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8083
ENV ASPNETCORE_URLS=http://0.0.0.0:8083
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "HackathonGame.ScoresService.dll"]
