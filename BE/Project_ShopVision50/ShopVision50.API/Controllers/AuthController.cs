using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Modules.Users.DTOs;
using ShopVision50.API.Services;

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

        [HttpPost("register")]   // <- chú ý là POST
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _userService.RegisterAsync(dto);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result);
        }
    }


}
