// Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Services.UserService_FD;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService) => _userService = userService;

        // GET api/users/getAll
        [HttpGet("getAll")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsyncSer();
            return Ok(users);
        }

        // GET api/users/getById/5
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result);
        }

        // PUT api/users/update/5
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

        // DELETE api/users/delete/5
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }
    }
}
