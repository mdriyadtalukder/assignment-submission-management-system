using ASMS.Api.Data;
using ASMS.Api.Models;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

namespace ASMS.Api.Services;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MongoContext db)
    {
        var defaults = new[]
        {
            ("admin@asms.com", "Admin@123", "Admin"),
            ("teacher@asms.com", "Teacher@123", "Teacher"),
            ("student@asms.com", "Student@123", "Student")
        };

        foreach (var item in defaults)
        {
            if (!await db.Users.Find(x => x.Email == item.Item1).AnyAsync())
            {
                await db.Users.InsertOneAsync(
                    new User
                    {
                        Email = item.Item1,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(item.Item2),
                        Role = item.Item3
                    });
            }
        }
    }
}

public static class SwaggerConfiguration
{
    public static void AddBearerSecurity(
        Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions options)
    {
        options.AddSecurityDefinition(
            "Bearer",
            new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });

        options.AddSecurityRequirement(
            new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
    }
}