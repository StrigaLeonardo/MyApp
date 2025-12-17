using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;
using System.Security.Claims;

namespace MyApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UserDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserDataController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserData/me
        [HttpGet("me")]
        public async Task<ActionResult<UserData>> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var data = await _context.UserData
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (data == null)
            {
                data = new UserData { UserId = userId };
            }

            return Ok(data);
        }

        // PUT: api/UserData/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe(UserData model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var data = await _context.UserData
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (data == null)
            {
                data = new UserData { UserId = userId };
                _context.UserData.Add(data);
            }

            data.FullName = model.FullName;
            data.Address = model.Address;
            data.Phone = model.Phone;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
