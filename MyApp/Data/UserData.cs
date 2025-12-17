namespace MyApp.Data
{
    public class UserData
    {
        public int Id { get; set; }

        public string UserId { get; set; } = null!;

        public string? FullName { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}
