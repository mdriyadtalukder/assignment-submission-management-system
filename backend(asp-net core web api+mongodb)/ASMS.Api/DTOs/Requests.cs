namespace ASMS.Api.DTOs;

public record LoginRequest(string Email, string Password);
public record UserRequest(string Email, string Password, string Role,List<string> CourseIds);
public record CourseRequest(string Name, string? Description);
public record SubjectRequest(string Name, string? CourseId, string? TeacherId);
public record AssignTeacherRequest(string TeacherId);
public record AssignmentRequest(string Title, string Description, DateTime Deadline, double MaximumMarks, string CourseId, string SubjectId);
public record AssignmentStatusRequest(string Status);
public record SubmissionRequest(string Content);
public record GradeRequest(double Marks, string? Feedback, string Status);
