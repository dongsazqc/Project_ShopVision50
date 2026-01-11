using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Shop_Db.Models;
using ShopVision50.API.Models.Login;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.API.Repositories.CartRepository_FD;
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
        private readonly ICartRepository _cartRepo;


        public UserService(IUserRepository repo, IEmailService emailService, IMemoryCache cache, ICartRepository cartRepo)
        {
            _repo = repo;
            _emailService = emailService;
            _cache = cache;
            _cartRepo = cartRepo;
        }


        public async Task<ServiceResult<List<User>>> GetAllUsersAsyncSer()
        {
            var users = await _repo.GetAllAsync();
            if (users == null || !users.Any())
                return ServiceResult<List<User>>.Fail("Không có người dùng nào trong hệ thống");

            return ServiceResult<List<User>>.Ok(users, "Lấy danh sách người dùng thành công");
        }

        public async Task<ServiceResult<User>> GetUserByIdAsync(int id)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                return ServiceResult<User>.Fail("Không tìm thấy người dùng");

            return ServiceResult<User>.Ok(user, "Lấy thông tin người dùng thành công");
        }

        public async Task<ServiceResult<User>> UpdateUserAsync(User user)
        {
            var existingUser = await _repo.GetByIdAsync(user.UserId);
            if (existingUser == null)
                return ServiceResult<User>.Fail("Không tìm thấy người dùng");

            existingUser.FullName = user.FullName;
            existingUser.Phone = user.Phone;
            existingUser.DefaultAddress = user.DefaultAddress;
            existingUser.Addresses = user.Addresses;
            existingUser.Status = user.Status;
            existingUser.RoleId = user.RoleId;

            var updatedUser = await _repo.UpdateAsync(existingUser);
            return ServiceResult<User>.Ok(updatedUser, "Cập nhật người dùng thành công");
        }



public async Task<ServiceResult<UserProfile>> UpdateUserProfileAsync(UserProfile user)
{
    var existingUser = await _repo.GetByIdAsync(user.UserId);
    if (existingUser == null)
        return ServiceResult<UserProfile>.Fail("Không tìm thấy người dùng");

    existingUser.FullName = user.FullName;
    existingUser.Phone = user.Phone;
    existingUser.DefaultAddress = user.DefaultAddress;
    var updatedUser = await _repo.UpdateAsync(existingUser);

    var userProfile = new UserProfile
    {
        UserId = updatedUser.UserId,
        FullName = updatedUser.FullName,
        Phone = updatedUser.Phone,
        DefaultAddress = updatedUser.DefaultAddress,
    };

    return ServiceResult<UserProfile>.Ok(userProfile, "Cập nhật người dùng thành công");
}


        public async Task<ServiceResult<string>> DeleteUserAsync(int userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
                return ServiceResult<string>.Fail("Không tìm thấy người dùng");

            var success = await _repo.DeleteAsync(user);
            return success
                ? ServiceResult<string>.Ok(null, "Xóa người dùng thành công")
                : ServiceResult<string>.Fail("Xóa người dùng thất bại");
        }

        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _repo.CheckEmailExistsAsync(email);
        }

        public async Task<ServiceResult<string>> SendOtpAsync(string email)
        {
            var exists = await _repo.CheckEmailExistsAsync(email);

            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"otp_{email}", otp, TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(email, "Mã OTP đăng ký ShopVision50", $"Mã OTP của bạn là: {otp}. Hết hạn sau 5 phút.");

            return ServiceResult<string>.Ok("OTP đã được gửi đến email");
        }

        public bool VerifyOtp(string email, string otp)
        {
            if (_cache.TryGetValue($"otp_{email}", out string cachedOtp))
                return cachedOtp == otp;

            return false;
        }

        public async Task<ServiceResult<string>> RegisterUserWithOtpAsync(RegisterConfirmDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Otp) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return ServiceResult<string>.Fail("Thông tin đăng ký không hợp lệ");
            }

            if (!VerifyOtp(dto.Email, dto.Otp))
                return ServiceResult<string>.Fail("OTP không hợp lệ hoặc đã hết hạn");

            var checkEmail = await _repo.GetByEmailAsync(dto.Email);
            if (checkEmail != null)
                return ServiceResult<string>.Fail("Email đã tồn tại");
            var checkPhone = await _repo.GetByPhoneAsync(dto.Phone);
            if (checkPhone != null)
                return ServiceResult<string>.Fail("Số điện thoại đã tồn tại");

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

            // Thêm user mới vào DB
            await _repo.AddAsync(user);

            // Tạo giỏ hàng mới cho user
            var cart = new Cart
            {
                UserId = user.UserId,
                CreatedDate = DateTime.Now,
                Status = true
            };

            // Thêm cart vào DB
            _cartRepo.AddCart(cart);
            await _cartRepo.SaveChangesAsync();

            // Xóa OTP trong cache
            if (_cache != null)
                _cache.Remove($"otp_{dto.Email}");

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

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _repo.UpdateAsync(user);

            _cache.Remove($"otp_change_pw_{user.Email}");

            return ServiceResult<string>.Ok("Đổi mật khẩu thành công");
        }
        //Quên mật khẩu
        public async Task<ServiceResult<string>> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _repo.GetByEmailAsync(dto.Email);
            if (user == null)
                return ServiceResult<string>.Fail("Email không tồn tại trong hệ thống");

            // Kiểm tra OTP
            if (!_cache.TryGetValue($"otp_{dto.Email}", out string cachedOtp))
                return ServiceResult<string>.Fail("OTP đã hết hạn hoặc không tồn tại");

            if (cachedOtp != dto.Otp)
                return ServiceResult<string>.Fail("OTP không chính xác");

            // Tạo mật khẩu ngẫu nhiên 10 ký tự mạnh
            string newPassword = GenerateStrongPassword(10);

            // Hash mật khẩu
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _repo.UpdateAsync(user);

            // Xóa OTP sau khi dùng
            _cache.Remove($"otp_{dto.Email}");

            // Gửi mật khẩu mới qua email
            await _emailService.SendEmailAsync(
                dto.Email,
                "Mật khẩu mới - ShopVision50",
                $"Mật khẩu mới của bạn là: {newPassword}"
            );

            return ServiceResult<string>.Ok("Đổi mật khẩu thành công");
        }

        // Hàm tạo mật khẩu mạnh 10 ký tự
        private string GenerateStrongPassword(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
