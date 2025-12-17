using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;
using System.Security.Claims;

namespace MyApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public FilesController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // TEST ruta: POST /api/files/ping
    [HttpPost("ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        Console.WriteLine("PING HIT");
        return Ok("PING OK");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FileRecord>>> GetMyFiles()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var files = await _context.Files
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.UploadedAt)
            .ToListAsync();

        return Ok(files);
    }

    [HttpPost]
    public async Task<ActionResult<FileRecord>> Upload(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        if (file == null || file.Length == 0) return BadRequest("No file.");

        var uploadsRoot = Path.Combine(_env.ContentRootPath, "UserFiles");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var record = new FileRecord
        {
            UserId = userId,
            FileName = file.FileName,
            UploadedAt = DateTime.UtcNow,
            StoragePath = fileName
        };

        _context.Files.Add(record);
        await _context.SaveChangesAsync();

        return Ok(record);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var fileRecord = await _context.Files.FirstOrDefaultAsync(f => f.Id == id);
        if (fileRecord == null) return NotFound();

        if (fileRecord.UserId != userId) return Forbid();

        var uploadsRoot = Path.Combine(_env.ContentRootPath, "UserFiles");
        var fullPath = Path.Combine(uploadsRoot, fileRecord.StoragePath);

        if (!System.IO.File.Exists(fullPath))
            return NotFound();

        var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
        var contentType = "application/octet-stream";

        return File(bytes, contentType, fileRecord.FileName);
    }
}
