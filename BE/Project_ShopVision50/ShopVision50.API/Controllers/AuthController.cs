using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Modules.Users.DTOs;
using ShopVision50.API.Services.UserService_FD;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("registerLogin")]   // <- chú ý là POST
        public async Task<IActionResult> RegisterUserApi([FromBody] RegisterDto dto)
        {
            var result = await _userService.RegisterUserAsync(dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpGet("getAllUsers")]  // <- chú ý là GET
        public async Task<IActionResult> GetAllUserApi()
        {
            var users = await _userService.GetAllUsersAsyncSer(); 
            return Ok(users);
            //api/auth/getAllUsers
        }
    }


}
