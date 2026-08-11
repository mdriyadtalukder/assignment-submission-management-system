using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ASMS.Api.Models;

public abstract class Entity
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)] public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public sealed class User : Entity { public string Email { get; set; } = ""; public string PasswordHash { get; set; } = ""; public string Role { get; set; } = ""; public List<string> CourseIds { get; set; } = new(); }
public sealed class Course : Entity { public string Name { get; set; } = ""; public string? Description { get; set; } }
public sealed class Subject : Entity { public string Name { get; set; } = ""; public string? CourseId { get; set; } public string? TeacherId { get; set; } }
public sealed class Assignment : Entity { public string Title { get; set; } = ""; public string Description { get; set; } = ""; public DateTime Deadline { get; set; } public double MaximumMarks { get; set; } public string CourseId { get; set; } = ""; public string SubjectId { get; set; } = ""; public string TeacherId { get; set; } = ""; public string Status { get; set; } = "Draft"; }
public sealed class Submission : Entity { public string AssignmentId { get; set; } = ""; public string StudentId { get; set; } = ""; public string Content { get; set; } = ""; public DateTime SubmittedAt { get; set; } public double? Marks { get; set; } public string? Feedback { get; set; } public string Status { get; set; } = "Submitted"; }
