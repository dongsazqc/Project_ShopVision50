using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.UserService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService) => _userService = userService;

<<<<<<< Updated upstream
        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers()
            => Ok(await _userService.GetAllUsersAsyncSer());

        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result);
        }

        [HttpPost("registerUser")]
        public async Task<IActionResult> RegisterUser([FromBody] UserDto dto)
        {
            var result = await _userService.RegisterUserAsync(dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpPut("updateUser/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto dto)
=======
        // POST api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto dataClientDto)
        {
            var result = await _userService.RegisterUserAsync(dataClientDto);
            if (result.Success) return Ok("Thêm người mới thành công");
            return BadRequest(result.Message);
        }

        // GET api/users/getAllUsers
        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _userService.GetAllUsersAsyncSer();
            return Ok(result);
        }

        // GET api/users/getById/
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result);
        }

        // PUT api/users/update/
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
>>>>>>> Stashed changes
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

<<<<<<< Updated upstream
        [HttpDelete("deleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
=======
        // DELETE api/users/delete/
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
>>>>>>> Stashed changes
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }
    }
}
