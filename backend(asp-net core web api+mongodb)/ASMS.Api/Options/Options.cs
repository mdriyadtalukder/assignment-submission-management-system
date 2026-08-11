namespace ASMS.Api.Options;

// mongodb

public sealed class MongoDbOptions
{
    public string ConnectionString { get; set; } = "";

    public string DatabaseName { get; set; } = "asms";
}

// jwt

public sealed class JwtOptions
{
    public string Key { get; set; } = "";

    public string Issuer { get; set; } = "ASMS.Api";

    public string Audience { get; set; } = "ASMS.Frontend";

    public int ExpiresMinutes { get; set; } = 120;
}