using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.UserService_FD;
using System.Threading.Tasks;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _svc;
        public UsersController(IUserService svc) => _svc = svc;

        // GET api/users/getAll
        [HttpGet("getAll")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _svc.GetAllUsersAsyncSer();
            return Ok(result);
        }

        // GET api/users/getById/
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _svc.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result);
        }

        // POST api/users/register (tạo user + quan hệ)
        [HttpPost("register")]
        [Consumes("application/json")]
        public async Task<IActionResult> Register([FromBody] UserDto dto)
        {
            if (dto == null) return BadRequest("Body trống hoặc Content-Type không phải application/json.");
            var result = await _svc.RegisterUserAsync(dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

        // PUT api/users/update/
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
        {
            var result = await _svc.UpdateUserAsync(id, dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

        // DELETE api/users/delete/
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _svc.DeleteUserAsync(id);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }
    }
}
