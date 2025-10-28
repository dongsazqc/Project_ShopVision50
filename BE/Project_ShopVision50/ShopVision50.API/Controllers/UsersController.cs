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


        [HttpPost("register")]  
        public async Task<IActionResult> Register([FromBody] UserDto dataclientDto)
        {
            var result = await _userService.RegisterUserAsync(dataclientDto);

            if (result.Success)
            {
                return Ok("Thêm người mới thành công");
            }
            else
            {
                return BadRequest(result.Message);
            }
        }

    }
}
