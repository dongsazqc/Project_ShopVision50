using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.UserService_FD
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo, AppDbContext db)
        {
            _repo = repo;
        }

        public UserService(IUserRepository repo) => _repo = repo;

        public async Task<ServiceResult<List<User>>> GetAllUsersAsyncSer()
        {
            var users = await _repo.GetAllAsync();
            if (users == null || !users.Any())
            {
                return ServiceResult<List<User>>.Fail("Không có người dùng nào trong hệ thống");
            }

            return ServiceResult<List<User>>.Ok(users, "Lấy danh sách người dùng thành công");
        }

        public async Task<ServiceResult<User>> GetUserByIdAsync(int id)
        {
      
            var user = await _repo.GetByIdAsync(id);

            if (user == null)
                return ServiceResult<User>.Fail("Không tìm thấy người dùng");

            return ServiceResult<User>.Ok(user, "Lấy thông tin người dùng thành công");
        
        }

        public async Task<ServiceResult<string>> RegisterUserAsync( User userClient)
        {
            var checkemail = await _repo.GetByEmailAsync(userClient.Email);
            if (checkemail != null)
            {
                return await Task.FromResult(ServiceResult<string>.Fail("Người dùng đã tồn tại"));
            }
            else
            {

                userClient.Password = BCrypt.Net.BCrypt.HashPassword(userClient.Password);
                 
                userClient.JoinDate = DateTime.Now;
                userClient.Status = true;

                await _repo.AddAsync(userClient);

                return await Task.FromResult(ServiceResult<string>.Ok("Đăng ký thành công"));
            }
        }

        public async Task<ServiceResult<User>> UpdateUserAsync(User user)
        {
            var existingUser = await _repo.GetByIdAsync(user.UserId);
            if (existingUser == null)
                return  ServiceResult<User>.Fail("Không tìm thấy người dùng");

            // Update mấy property cần thiết
            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;
            existingUser.Phone = user.Phone;
            existingUser.DefaultAddress = user.DefaultAddress;
            existingUser.Addresses = user.Addresses;
            existingUser.Status = user.Status;ls
            existingUser.RoleId = user.RoleId;

            var updatedUser = await _repo.UpdateAsync(existingUser);
            return ServiceResult<User>.Ok(updatedUser, "Cập nhật người dùng thành công");
        }

        public async Task<ServiceResult<string>> DeleteUserAsync(int userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
                return ServiceResult<string>.Fail("Không tìm thấy người dùng");

            var success = await _repo.DeleteAsync(user);
            if (success)
                return ServiceResult<string>.Ok(null, "Xóa người dùng thành công");
            else
                return ServiceResult<string>.Fail("Xóa người dùng thất bại");
        }

       
    }
}
