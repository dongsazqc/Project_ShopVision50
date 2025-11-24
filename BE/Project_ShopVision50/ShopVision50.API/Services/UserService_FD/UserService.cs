using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Shop_Db.Models;
using ShopVision50.API.Models.Login;
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
    private readonly IEmailService _emailService;
    private readonly IMemoryCache _cache;
    public UserService(IUserRepository repo, IEmailService emailService, IMemoryCache cache)
    {
        _repo = repo;
        _emailService = emailService;
        _cache = cache;
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

        // public async Task<ServiceResult<string>> RegisterUserAsync( User userClient)
        // {
        //     var checkemail = await _repo.GetByEmailAsync(userClient.Email);
        //     if (checkemail != null)
        //     {
        //         return await Task.FromResult(ServiceResult<string>.Fail("Người dùng đã tồn tại"));
        //     }
        //     else
        //     {

        //         userClient.Password = BCrypt.Net.BCrypt.HashPassword(userClient.Password);
                 
        //         userClient.JoinDate = DateTime.Now;
        //         userClient.Status = true;

        //         await _repo.AddAsync(userClient);

        //         return await Task.FromResult(ServiceResult<string>.Ok("Đăng ký thành công"));
        //     }
        // }
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
            existingUser.Status = user.Status;
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

        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _repo.CheckEmailExistsAsync(email);        }


             public async Task<ServiceResult<string>> SendOtpAsync(string email)
    {
        var exists = await _repo.CheckEmailExistsAsync(email);
        if (exists)
            return ServiceResult<string>.Fail("Email đã được đăng ký");

        var otp = new Random().Next(100000, 999999).ToString();

        _cache.Set($"otp_{email}", otp, TimeSpan.FromMinutes(5));

        await _emailService.SendEmailAsync(email, "Mã OTP đăng ký ShopVision50", $"Mã OTP của bạn là: {otp}. Hết hạn sau 5 phút.");

        return ServiceResult<string>.Ok("OTP đã được gửi đến email");
    }

    public bool VerifyOtp(string email, string otp)
    {
        if (_cache.TryGetValue($"otp_{email}", out string cachedOtp))
        {
            return cachedOtp == otp;
        }
        return false;
    }

    public async Task<ServiceResult<string>> RegisterUserWithOtpAsync(RegisterConfirmDto dto)
    {
        if (!VerifyOtp(dto.Email, dto.Otp))
            return ServiceResult<string>.Fail("OTP không hợp lệ hoặc đã hết hạn");

        var checkEmail = await _repo.GetByEmailAsync(dto.Email);
        if (checkEmail != null)
            return ServiceResult<string>.Fail("Email đã tồn tại");
            
        if (dto == null ||
    string.IsNullOrWhiteSpace(dto.Email) ||
    string.IsNullOrWhiteSpace(dto.Otp) ||
    string.IsNullOrWhiteSpace(dto.Password))
{
    return ServiceResult<string>.Fail("Thông tin đăng ký không hợp lệ");
}
    

        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            JoinDate = DateTime.Now,
            Status = true,
            RoleId = dto.RoleId,
        };

        await _repo.AddAsync(user);
        _cache.Remove($"otp_{dto.Email}"); // Xóa OTP sau khi dùng

        return ServiceResult<string>.Ok("Đăng ký thành công");
    }
        // Gửi OTP đổi mật khẩu
        public async Task<ServiceResult<string>> SendOtpChangePasswordAsync(int userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) return ServiceResult<string>.Fail("Không tìm thấy user");

            if (string.IsNullOrEmpty(user.Email))
                return ServiceResult<string>.Fail("User không có email");

            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"otp_change_pw_{user.Email}", otp, TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(
                user.Email,
                "OTP đổi mật khẩu ShopVision50",
                $"Mã OTP của bạn là: {otp}. Hết hạn sau 5 phút."
            );

            return ServiceResult<string>.Ok("OTP đã được gửi");
        }


        // Đổi mật khẩu bằng OTP
        public async Task<ServiceResult<string>> ChangePasswordWithOtpAsync(ChangePasswordOtpDto dto)
        {
            var user = await _repo.GetByIdAsync(dto.UserId);
            if (user == null) return ServiceResult<string>.Fail("Không tìm thấy user");

            if (!_cache.TryGetValue($"otp_change_pw_{user.Email}", out string cachedOtp))
                return ServiceResult<string>.Fail("OTP hết hạn hoặc không tồn tại");

            if (cachedOtp != dto.Otp)
                return ServiceResult<string>.Fail("OTP không chính xác");

            // cập nhật mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _repo.UpdateAsync(user);

            // xóa otp
            _cache.Remove($"otp_change_pw_{user.Email}");

            return ServiceResult<string>.Ok("Đổi mật khẩu thành công");
        }


    }
    }

