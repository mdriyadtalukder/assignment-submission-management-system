using ASMS.Api.Data;
using ASMS.Api.DTOs;
using ASMS.Api.Models;
using BCryptHasher = BCrypt.Net.BCrypt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ASMS.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public sealed class AdminController(MongoContext db) : ControllerBase
{
    //for users

    [HttpGet("users")]
    public async Task<IActionResult> Users()
    {
        var users = await db.Users
            .Find(_ => true)
            .Project(x => new
            {
                x.Id,
                x.Email,
                x.Role,
                x.CourseIds
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(UserRequest r)
    {
        var email = r.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(r.Password))
            return BadRequest("Password is required.");

        if (string.IsNullOrWhiteSpace(r.Role))
            return BadRequest("Role is required.");

        var validRoles = new[]
        {
            "Admin",
            "Teacher",
            "Student"
        };

        if (!validRoles.Contains(r.Role))
            return BadRequest("Invalid role.");

        var exists = await db.Users
            .Find(x => x.Email == email)
            .AnyAsync();

        if (exists)
            return Conflict("Email already exists.");

        var user = new User
        {
            Email = email,
            PasswordHash = BCryptHasher.HashPassword(r.Password),
            Role = r.Role,
            CourseIds = r.Role == "Student"
        ? r.CourseIds.Distinct().ToList()
        : new List<string>()
        };

        await db.Users.InsertOneAsync(user);

        return Created(
            $"api/admin/users/{user.Id}",
            new
            {
                user.Id,
                user.Email,
                user.Role,
                user.CourseIds
            });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(
        string id,
        UserRequest r)
    {
        var existingUser = await db.Users
            .Find(x => x.Id == id)
            .FirstOrDefaultAsync();

        if (existingUser is null)
            return NotFound("User not found.");

        var email = r.Email.Trim().ToLowerInvariant();

        var emailExists = await db.Users
            .Find(x =>
                x.Email == email &&
                x.Id != id)
            .AnyAsync();

        if (emailExists)
            return Conflict("Email already exists.");

        var validRoles = new[]
        {
            "Admin",
            "Teacher",
            "Student"
        };

        if (!validRoles.Contains(r.Role))
            return BadRequest("Invalid role.");

        var update = Builders<User>.Update
            .Set(x => x.Email, email)
            .Set(x => x.Role, r.Role)
            .Set(x => x.CourseIds, r.CourseIds);

        if (!string.IsNullOrWhiteSpace(r.Password))
        {
            update = update.Set(
                x => x.PasswordHash,
                BCryptHasher.HashPassword(r.Password)
            );
        }

        await db.Users.UpdateOneAsync(
            x => x.Id == id,
            update
        );

        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await db.Users.DeleteOneAsync(
            x => x.Id == id
        );

        if (result.DeletedCount == 0)
            return NotFound("User not found.");

        return NoContent();
    }

    //for courses

    [HttpGet("courses")]
    public async Task<IActionResult> Courses()
    {
        var courses = await db.Courses
            .Find(_ => true)
            .ToListAsync();

        return Ok(courses);
    }

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse(
        CourseRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name))
            return BadRequest("Course name is required.");

        var course = new Course
        {
            Name = r.Name,
            Description = r.Description
        };

        await db.Courses.InsertOneAsync(course);

        return Created(
            $"api/admin/courses/{course.Id}",
            course
        );
    }

    [HttpPut("courses/{id}")]
    public async Task<IActionResult> UpdateCourse(
        string id,
        CourseRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name))
            return BadRequest("Course name is required.");

        var update = Builders<Course>.Update
            .Set(x => x.Name, r.Name)
            .Set(x => x.Description, r.Description);

        var result = await db.Courses.UpdateOneAsync(
            x => x.Id == id,
            update
        );

        if (result.MatchedCount == 0)
            return NotFound("Course not found.");

        return NoContent();
    }

    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        var result = await db.Courses.DeleteOneAsync(
            x => x.Id == id
        );

        if (result.DeletedCount == 0)
            return NotFound("Course not found.");

        return NoContent();
    }

    //for subjects

    [HttpGet("subjects")]
    public async Task<IActionResult> Subjects()
    {
        var subjects = await db.Subjects
            .Find(_ => true)
            .ToListAsync();

        return Ok(subjects);
    }

    [HttpPost("subjects")]
    public async Task<IActionResult> CreateSubject(
        SubjectRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name))
            return BadRequest("Subject name is required.");

        if (string.IsNullOrWhiteSpace(r.CourseId))
            return BadRequest("CourseId is required.");

        var courseExists = await db.Courses
            .Find(x => x.Id == r.CourseId)
            .AnyAsync();

        if (!courseExists)
            return BadRequest("Course not found.");

        if (!string.IsNullOrWhiteSpace(r.TeacherId))
        {
            var teacherExists = await db.Users
                .Find(x =>
                    x.Id == r.TeacherId &&
                    x.Role == "Teacher")
                .AnyAsync();

            if (!teacherExists)
                return BadRequest("Teacher not found.");
        }

        var subject = new Subject
        {
            Name = r.Name,
            CourseId = r.CourseId,
            TeacherId = r.TeacherId
        };

        await db.Subjects.InsertOneAsync(subject);

        return Created(
            $"api/admin/subjects/{subject.Id}",
            subject
        );
    }

    [HttpPut("subjects/{id}")]
    public async Task<IActionResult> UpdateSubject(
        string id,
        SubjectRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name))
            return BadRequest("Subject name is required.");

        if (string.IsNullOrWhiteSpace(r.CourseId))
            return BadRequest("CourseId is required.");

        var courseExists = await db.Courses
            .Find(x => x.Id == r.CourseId)
            .AnyAsync();

        if (!courseExists)
            return BadRequest("Course not found.");

        if (!string.IsNullOrWhiteSpace(r.TeacherId))
        {
            var teacherExists = await db.Users
                .Find(x =>
                    x.Id == r.TeacherId &&
                    x.Role == "Teacher")
                .AnyAsync();

            if (!teacherExists)
                return BadRequest("Teacher not found.");
        }

        var update = Builders<Subject>.Update
            .Set(x => x.Name, r.Name)
            .Set(x => x.CourseId, r.CourseId)
            .Set(x => x.TeacherId, r.TeacherId);

        var result = await db.Subjects.UpdateOneAsync(
            x => x.Id == id,
            update
        );

        if (result.MatchedCount == 0)
            return NotFound("Subject not found.");

        return NoContent();
    }

    [HttpDelete("subjects/{id}")]
    public async Task<IActionResult> DeleteSubject(string id)
    {
        var result = await db.Subjects.DeleteOneAsync(
            x => x.Id == id
        );

        if (result.DeletedCount == 0)
            return NotFound("Subject not found.");

        return NoContent();
    }


    //assign teacher

    [HttpPut("subjects/{id}/teacher")]
    public async Task<IActionResult> AssignTeacher(
        string id,
        AssignTeacherRequest r)
    {
        var teacherExists = await db.Users
            .Find(x =>
                x.Id == r.TeacherId &&
                x.Role == "Teacher")
            .AnyAsync();

        if (!teacherExists)
            return BadRequest("Teacher not found.");

        var subjectExists = await db.Subjects
            .Find(x => x.Id == id)
            .AnyAsync();

        if (!subjectExists)
            return NotFound("Subject not found.");

        var result = await db.Subjects.UpdateOneAsync(
            x => x.Id == id,
            Builders<Subject>.Update
                .Set(x => x.TeacherId, r.TeacherId)
        );

        return NoContent();
    }

    //assignments

    [HttpGet("assignments")]
    public async Task<IActionResult> Assignments()
    {
        var assignments = await db.Assignments
            .Find(_ => true)
            .ToListAsync();

        return Ok(assignments);
    }


    //submissions

    [HttpGet("submissions")]
    public async Task<IActionResult> Submissions()
    {
        var submissions = await db.Submissions
            .Find(_ => true)
            .ToListAsync();

        return Ok(submissions);
    }
}