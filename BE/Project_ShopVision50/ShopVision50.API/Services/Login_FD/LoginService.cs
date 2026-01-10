using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;

namespace ShopVision50.API.Services.Login_FD
{
    public class LoginService : ILoginService
    {
            public IUserRepository  _repo;
        public LoginService(IUserRepository repo)
        {
            _repo = repo;
        }
      
        public async Task<ServiceResult<User>> AuthenticateUserAsync(string email, string password, bool isClientLogin = false)
        {
            var user = await _repo.GetByEmailAsync(email);

            if (user == null)
                return ServiceResult<User>.Fail("Email không tồn tại");
            if(user.Status == false)
                return ServiceResult<User>.Fail("Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên hoặc thử lại sau!");
            
           

            bool validPass = BCrypt.Net.BCrypt.Verify(password, user.Password);
            if (!validPass)
                return ServiceResult<User>.Fail("Mật khẩu không đúng");


            // Nếu đây là yêu cầu đăng nhập từ client, chỉ cho phép roleId = 2
            if (isClientLogin && user.RoleId != 2)
            {
                return ServiceResult<User>.Fail("Đăng nhập thất bại vui lòng thử lại sau!");
            }

            return ServiceResult<User>.Ok(user, "Đăng nhập thành công");
        }




    }
}