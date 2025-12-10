using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Shop_Db.Models;
using ShopVision50.API.Models.Login;
using ShopVision50.API.Services.Login_FD;
using ShopVision50.API.Services.UserService_FD;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ILoginService _userService;
        private readonly IConfiguration _configuration;

        public LoginController(ILoginService loginService, IConfiguration configuration)
        {
            _userService = loginService;
            _configuration = configuration;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dữ liệu không hợp lệ!");

            // ✅ Gọi service kiểm tra user
            var result = await _userService.AuthenticateUserAsync(dto.Email, dto.Password);
            if (!result.Success)
                return Unauthorized(result.Message);

            var user = result.Data;

                var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "User")
            };


            // ✅ Sinh key bí mật
            var secretKey = _configuration["JwtSettings:SecretKey"];
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // ✅ Sinh token
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            // ✅ Trả token cho client
            return Ok(new
            {
                message = "Đăng nhập thành công!",
                token = jwt,
                expires = token.ValidTo,
                user = new 
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    FullName = user.FullName,
                    RoleId  = user.RoleId,
                } 

            });
        }
    }
}
