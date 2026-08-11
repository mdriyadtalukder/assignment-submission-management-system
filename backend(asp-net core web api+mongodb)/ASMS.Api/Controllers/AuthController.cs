using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ASMS.Api.Data;
using ASMS.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace ASMS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    MongoContext db
) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {

        // Find User

        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await db.Users
            .Find(x => x.Email == email)
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return Unauthorized(
                "Invalid email or password."
            );
        }


        // Verify Password

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );

        if (!passwordValid)
        {
            return Unauthorized(
                "Invalid email or password."
            );
        }


        // JWT Configuration

        var jwtKey =
            Environment.GetEnvironmentVariable(
                "JWT_KEY"
            );

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            return StatusCode(
                500,
                "JWT_KEY environment variable is missing."
            );
        }

        var jwtIssuer =
            Environment.GetEnvironmentVariable(
                "JWT_ISSUER"
            ) ?? "ASMS.Api";

        var jwtAudience =
            Environment.GetEnvironmentVariable(
                "JWT_AUDIENCE"
            ) ?? "ASMS.Client";

        var expiresMinutesString =
            Environment.GetEnvironmentVariable(
                "JWT_EXPIRES_MINUTES"
            );

        var expiresMinutes =
            int.TryParse(
                expiresMinutesString,
                out var minutes
            )
                ? minutes
                : 120;


        // Claims

        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id
            ),

            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };


        // Create Security Key

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );


        // Create JWT

        var token =
            new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    expiresMinutes
                ),
                signingCredentials:
                    new SigningCredentials(
                        key,
                        SecurityAlgorithms.HmacSha256
                    )
            );




        return Ok(new
        {
            token =
                new JwtSecurityTokenHandler()
                    .WriteToken(token),

            user = new
            {
                user.Id,
                user.Email,
                user.Role,
                user.CourseIds
            }
        });
    }
}