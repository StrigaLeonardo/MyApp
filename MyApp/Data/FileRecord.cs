namespace MyApp.Data
{
    public class FileRecord
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public DateTime UploadedAt { get; set; }
        public string? StoragePath { get; set; }  
    }
}
