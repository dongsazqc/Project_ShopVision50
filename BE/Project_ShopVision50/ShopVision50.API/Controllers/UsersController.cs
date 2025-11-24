using Microsoft.AspNetCore.Mvc;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Services.UserService_FD;
using Shop_Db.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ShopVision50.API.Models.Login;

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
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _svc.GetAllUsersAsyncSer();
            if (!result.Success) return NotFound(result.Message);
            return Ok(result.Data);
        }

        // GET api/users/getById/{id}
        [HttpGet("getById/{id}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var result = await _svc.GetUserByIdAsync(id);
            if (!result.Success) return NotFound(result.Message);
            return Ok(result.Data);
        }

        // POST api/users/register
        // [HttpPost("register")]
        // [Authorize]
        // public async Task<IActionResult> Register([FromBody] User user)
        // {
        //     if (user == null) return BadRequest("Body trống");
        //     var result = await _svc.RegisterUserAsync(user);
        //     if (!result.Success) return BadRequest(result.Message);
        //     return Ok(result.Message);
        // }

        // PUT api/users/update
       [HttpPut("update/{id}")]
       [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] User user)
        {
            if (user == null) return BadRequest("Body trống");
            if (id != user.UserId) return BadRequest("Id trong URL và trong body không khớp");

            var result = await _svc.UpdateUserAsync(user);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Data);
        }


        // DELETE api/users/delete/{id}
        [HttpDelete("delete/{id}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var result = await _svc.DeleteUserAsync(id);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }



    [HttpPost("check-email")]
    public async Task<IActionResult> CheckEmail([FromBody] CheckEmail dto)
    {
        if (string.IsNullOrEmpty(dto.Email))
            return BadRequest("Email không được để trống.");

        var exists = await _svc.CheckEmailExistsAsync(dto.Email);

        return Ok(new
        {
            email = dto.Email,
            exists
        });


        
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] EmailDto dto)
    {
        if (string.IsNullOrEmpty(dto.Email)) return BadRequest("Email không được để trống");
        var result = await _svc.SendOtpAsync(dto.Email);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Message);
    }
         
            [HttpPost("register-with-otp")]
    public async Task<IActionResult> RegisterWithOtp([FromBody] RegisterConfirmDto dto)
    {
        var result = await _svc.RegisterUserWithOtpAsync(dto);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Message);
    }
    }
}
