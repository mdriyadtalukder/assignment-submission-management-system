using System.Text;
using ASMS.Api.Data;
using ASMS.Api.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

Env.Load();

var builder = WebApplication.CreateBuilder(args);


// MongoDB

builder.Services.AddSingleton<MongoContext>();


// CORS

var allowedOrigins =
    builder.Configuration
        .GetSection("AllowedOrigins")
        .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Controllers

builder.Services.AddControllers();


// Swagger

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(
    options =>
        SwaggerConfiguration.AddBearerSecurity(options)
);


// JWT Environment Variables

var jwtKey =
    Environment.GetEnvironmentVariable("JWT_KEY")
    ?? throw new InvalidOperationException(
        "JWT_KEY is required."
    );

var jwtIssuer =
    Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? "ASMS.Api";

var jwtAudience =
    Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? "ASMS.Client";


// JWT Authentication

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });


// Authorization

builder.Services.AddAuthorization();



var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();


app.UseCors("Frontend");


app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();



using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<MongoContext>();

    await DatabaseSeeder.SeedAsync(db);
}


app.MapGet("/", () => new
{
    message = "ASMS API is running",
    status = "OK"
});


app.Run();