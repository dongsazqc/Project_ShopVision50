using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.UserService_FD;
using Shop_Db.Models;
using System.Collections.Generic;
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
            if (!result.Success) return NotFound(result.Message);
            return Ok(result.Data);
        }

        // GET api/users/getById/{id}
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var result = await _svc.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result.Data);
        }

        // POST api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (user == null) return BadRequest("Body trống");
            var result = await _svc.RegisterUserAsync(user);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }

        // PUT api/users/update
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] User user)
        {
            if (user == null) return BadRequest("Body trống");
            var result = await _svc.UpdateUserAsync(user);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Data);
        }

        // DELETE api/users/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var result = await _svc.DeleteUserAsync(id);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }
    }
}
