using System.Security.Claims;
using ASMS.Api.Data;
using ASMS.Api.DTOs;
using ASMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
namespace ASMS.Api.Controllers;


//for teacher

[ApiController]
[Route("api/teacher")]
[Authorize(Roles = "Teacher")]
public sealed class TeacherController(MongoContext db) : ControllerBase
{
    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException(
            "User ID not found."
        );

    //courses

    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await db.Courses
            .Find(_ => true)
            .ToListAsync();

        return Ok(courses);
    }



    // subjects
    // Only subjects assigned to this teacher

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var subjects = await db.Subjects
            .Find(x => x.TeacherId == UserId)
            .ToListAsync();

        return Ok(subjects);
    }


    //get assignments

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments()
    {
        var assignments = await db.Assignments
            .Find(x => x.TeacherId == UserId)
            .ToListAsync();

        return Ok(assignments);
    }


    //create assignments

    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment(
        AssignmentRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(r.Description))
            return BadRequest("Description is required.");

        if (string.IsNullOrWhiteSpace(r.CourseId))
            return BadRequest("Course is required.");

        if (string.IsNullOrWhiteSpace(r.SubjectId))
            return BadRequest("Subject is required.");

        if (r.MaximumMarks <= 0)
            return BadRequest(
                "Maximum marks must be positive."
            );

        var deadline = r.Deadline.ToUniversalTime();

        if (deadline <= DateTime.UtcNow)
            return BadRequest(
                "Deadline must be in the future."
            );


        //check course exist

        var courseExists = await db.Courses
            .Find(x => x.Id == r.CourseId)
            .AnyAsync();

        if (!courseExists)
            return BadRequest("Course not found.");


        // Check subject
        // Subject must:
        // 1. Exist
        // 2. Belong to selected course
        // 3. Be assigned to logged-in teacher

        var subject = await db.Subjects
            .Find(x =>
                x.Id == r.SubjectId &&
                x.CourseId == r.CourseId &&
                x.TeacherId == UserId
            )
            .FirstOrDefaultAsync();

        if (subject is null)
        {
            return BadRequest(
                "Selected subject is not assigned to you or does not belong to the selected course."
            );
        }


        // Create assignment

        var assignment = new Assignment
        {
            Title = r.Title.Trim(),

            Description = r.Description.Trim(),

            Deadline = deadline,

            MaximumMarks = r.MaximumMarks,

            CourseId = r.CourseId,

            SubjectId = r.SubjectId,

            TeacherId = UserId,

            Status = "Draft"
        };

        await db.Assignments.InsertOneAsync(
            assignment
        );

        return Created(
            $"api/teacher/assignments/{assignment.Id}",
            assignment
        );
    }


    //update assignments
    [HttpPut("assignments/{id}")]
    public async Task<IActionResult> UpdateAssignment(
        string id,
        AssignmentRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(r.Description))
            return BadRequest(
                "Description is required."
            );

        if (r.MaximumMarks <= 0)
            return BadRequest(
                "Maximum marks must be positive."
            );

        var deadline = r.Deadline.ToUniversalTime();

        if (deadline <= DateTime.UtcNow)
            return BadRequest(
                "Deadline must be in the future."
            );


        // Find assignment owned by teacher

        var assignment = await db.Assignments
            .Find(x =>
                x.Id == id &&
                x.TeacherId == UserId
            )
            .FirstOrDefaultAsync();

        if (assignment is null)
            return NotFound(
                "Assignment not found."
            );



        // Check course

        var courseExists = await db.Courses
            .Find(x => x.Id == r.CourseId)
            .AnyAsync();

        if (!courseExists)
            return BadRequest(
                "Course not found."
            );


        // Check subject belongs to:
        // selected course + teacher

        var subject = await db.Subjects
            .Find(x =>
                x.Id == r.SubjectId &&
                x.CourseId == r.CourseId &&
                x.TeacherId == UserId
            )
            .FirstOrDefaultAsync();

        if (subject is null)
        {
            return BadRequest(
                "Selected subject is not assigned to you or does not belong to the selected course."
            );
        }


        // Update

        assignment.Title =
            r.Title.Trim();

        assignment.Description =
            r.Description.Trim();

        assignment.Deadline =
            deadline;

        assignment.MaximumMarks =
            r.MaximumMarks;

        assignment.CourseId =
            r.CourseId;

        assignment.SubjectId =
            r.SubjectId;


        await db.Assignments.ReplaceOneAsync(
            x =>
                x.Id == id &&
                x.TeacherId == UserId,
            assignment
        );

        return Ok(assignment);
    }

    //publish or draft

    [HttpPatch("assignments/{id}/status")]
    public async Task<IActionResult> SetStatus(
        string id,
        AssignmentStatusRequest r)
    {
        if (r.Status != "Published" &&
            r.Status != "Draft")
        {
            return BadRequest(
                "Status must be Published or Draft."
            );
        }

        var result =
            await db.Assignments.UpdateOneAsync(
                x =>
                    x.Id == id &&
                    x.TeacherId == UserId,

                Builders<Assignment>.Update
                    .Set(
                        x => x.Status,
                        r.Status
                    )
            );

        if (result.MatchedCount == 0)
            return NotFound();

        return NoContent();
    }


    //delete assignment
    [HttpDelete("assignments/{id}")]
    public async Task<IActionResult> DeleteAssignment(
        string id)
    {
        var result =
            await db.Assignments.DeleteOneAsync(
                x =>
                    x.Id == id &&
                    x.TeacherId == UserId
            );

        if (result.DeletedCount == 0)
            return NotFound();

        return NoContent();
    }

    //view student submissins

    [HttpGet("submissions")]
    public async Task<IActionResult> GetSubmissions()
    {
        var assignmentIds =
            await db.Assignments
                .Find(x =>
                    x.TeacherId == UserId
                )
                .Project(x => x.Id)
                .ToListAsync();

        if (assignmentIds.Count == 0)
            return Ok(Array.Empty<Submission>());

        var submissions =
            await db.Submissions
                .Find(x =>
                    assignmentIds.Contains(
                        x.AssignmentId
                    )
                )
                .ToListAsync();

        return Ok(submissions);
    }


    //grade submissions

    [HttpPut("submissions/{id}")]
    public async Task<IActionResult> Grade(
        string id,
        GradeRequest r)
    {
        var submission =
            await db.Submissions
                .Find(x => x.Id == id)
                .FirstOrDefaultAsync();

        if (submission is null)
            return NotFound(
                "Submission not found."
            );


        // Make sure submission belongs to
        // teacher's assignment

        var assignment =
            await db.Assignments
                .Find(x =>
                    x.Id == submission.AssignmentId &&
                    x.TeacherId == UserId
                )
                .FirstOrDefaultAsync();

        if (assignment is null)
        {
            return NotFound(
                "Assignment not found or not owned by you."
            );
        }


        // Validate marks

        if (r.Marks < 0 ||
            r.Marks > assignment.MaximumMarks)
        {
            return BadRequest(
                $"Marks must be between 0 and {assignment.MaximumMarks}."
            );
        }


        // Validate status

        var allowedStatuses =
            new[]
            {
                "Submitted",
                "Graded",
                "Late",
                "Rejected"
            };

        if (!allowedStatuses.Contains(r.Status))
        {
            return BadRequest(
                "Invalid submission status."
            );
        }


        // Update submission

        submission.Marks =
            r.Marks;

        submission.Feedback =
            r.Feedback;

        submission.Status =
            r.Status;


        await db.Submissions.ReplaceOneAsync(
            x => x.Id == id,
            submission
        );

        return Ok(submission);
    }
}

//for student

[ApiController]
[Route("api/student")]
[Authorize(Roles = "Student")]
public sealed class StudentController(MongoContext db) : ControllerBase
{
    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User ID not found.");


    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments()
    {
        var student = await db.Users
            .Find(x => x.Id == UserId && x.Role == "Student")
            .FirstOrDefaultAsync();

        if (student is null)
            return NotFound("Student not found.");

        if (student.CourseIds.Count == 0) return Ok(new List<Assignment>());

        var assignments = await db.Assignments
            .Find(x =>
                student.CourseIds.Contains(x.CourseId) &&
                x.Status == "Published")
            .ToListAsync();

        return Ok(assignments);
    }



    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignment(string id)
    {
        var student = await db.Users
            .Find(x => x.Id == UserId && x.Role == "Student")
            .FirstOrDefaultAsync();

        if (student is null)
            return NotFound("Student not found.");

        var assignment = await db.Assignments
            .Find(x =>
                x.Id == id &&
                student.CourseIds.Contains(x.CourseId) &&
                x.Status == "Published")
            .FirstOrDefaultAsync();

        if (assignment is null)
            return NotFound("Assignment not found.");

        return Ok(assignment);
    }




    [HttpGet("submissions")]
    public async Task<IActionResult> GetSubmissions()
    {
        var submissions = await db.Submissions
            .Find(x => x.StudentId == UserId)
            .ToListAsync();

        return Ok(submissions);
    }


    //submit ans

    [HttpPost("assignments/{assignmentId}/submissions")]
    public async Task<IActionResult> CreateSubmission(
        string assignmentId,
        SubmissionRequest r)
    {
        var student = await db.Users
            .Find(x => x.Id == UserId && x.Role == "Student")
            .FirstOrDefaultAsync();

        if (student is null)
            return NotFound("Student not found.");

        if (student.CourseIds.Count == 0) return BadRequest("Student is not assigned to any course.");

        // Check assignment belongs to student's course
        var assignment = await db.Assignments
            .Find(x =>
                x.Id == assignmentId &&
                student.CourseIds.Contains(x.CourseId) &&
                x.Status == "Published")
            .FirstOrDefaultAsync();

        if (assignment is null)
            return NotFound("Assignment not found.");

        // Check deadline
        if (assignment.Deadline <= DateTime.UtcNow)
            return BadRequest("Assignment deadline has passed.");

        // Prevent duplicate submission
        var alreadySubmitted = await db.Submissions
            .Find(x =>
                x.AssignmentId == assignmentId &&
                x.StudentId == UserId)
            .AnyAsync();

        if (alreadySubmitted)
            return Conflict(
                "You have already submitted this assignment."
            );

        var submission = new Submission
        {
            AssignmentId = assignmentId,
            StudentId = UserId,
            Content = r.Content,
            SubmittedAt = DateTime.UtcNow,
            Status = "Submitted"
        };

        await db.Submissions.InsertOneAsync(submission);

        return Created(
            $"api/student/submissions/{submission.Id}",
            submission
        );
    }


    //update submissions

    [HttpPut("submissions/{id}")]
    public async Task<IActionResult> UpdateSubmission(
        string id,
        SubmissionRequest r)
    {
        var submission = await db.Submissions
            .Find(x =>
                x.Id == id &&
                x.StudentId == UserId)
            .FirstOrDefaultAsync();

        if (submission is null)
            return NotFound("Submission not found.");

        var assignment = await db.Assignments
            .Find(x => x.Id == submission.AssignmentId)
            .FirstOrDefaultAsync();

        if (assignment is null)
            return NotFound("Assignment not found.");

        // Deadline check
        if (assignment.Deadline <= DateTime.UtcNow)
        {
            return BadRequest(
                "Submission can no longer be updated."
            );
        }



        submission.Content = r.Content;
        submission.SubmittedAt = DateTime.UtcNow;

        await db.Submissions.ReplaceOneAsync(
            x => x.Id == id &&
                 x.StudentId == UserId,
            submission
        );

        return Ok(submission);
    }
}