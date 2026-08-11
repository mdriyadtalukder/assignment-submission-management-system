using ASMS.Api.Models;
using MongoDB.Driver;

namespace ASMS.Api.Data;

public sealed class MongoContext
{
    private readonly IMongoDatabase _database;

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("users");

    public IMongoCollection<Course> Courses =>
        _database.GetCollection<Course>("courses");

    public IMongoCollection<Subject> Subjects =>
        _database.GetCollection<Subject>("subjects");

    public IMongoCollection<Assignment> Assignments =>
        _database.GetCollection<Assignment>("assignments");

    public IMongoCollection<Submission> Submissions =>
        _database.GetCollection<Submission>("submissions");


    public MongoContext(IConfiguration configuration)
    {
        var connectionString =
            Environment.GetEnvironmentVariable(
                "MONGODB_CONNECTION_STRING")
            ?? throw new InvalidOperationException(
                "MONGODB_CONNECTION_STRING is required."
            );

        var databaseName =
            Environment.GetEnvironmentVariable(
                "MONGODB_DATABASE_NAME")
            ?? "asms";

        _database = new MongoClient(connectionString)
            .GetDatabase(databaseName);


        Users.Indexes.CreateOne(
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys
                    .Ascending(x => x.Email),
                new CreateIndexOptions
                {
                    Unique = true
                }
            )
        );


        Submissions.Indexes.CreateOne(
            new CreateIndexModel<Submission>(
                Builders<Submission>.IndexKeys.Combine(
                    Builders<Submission>.IndexKeys
                        .Ascending(x => x.AssignmentId),

                    Builders<Submission>.IndexKeys
                        .Ascending(x => x.StudentId)
                ),
                new CreateIndexOptions
                {
                    Unique = true
                }
            )
        );
    }
}