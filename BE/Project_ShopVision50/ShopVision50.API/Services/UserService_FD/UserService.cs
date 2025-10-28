using Microsoft.EntityFrameworkCore;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories;
using ShopVision50.Infrastructure;
using System.Text;

namespace ShopVision50.API.Services.UserService_FD
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public Task<ServiceResult<bool>> DeleteUserAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceResult<List<UserDto>>> GetAllUsersAsyncSer()
        {
            throw new NotImplementedException();
        }

        public Task<ServiceResult<object>> GetUserByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

            public async Task<ServiceResult<string>> RegisterUserAsync(UserDto dto)
            {
                try
                {
                    // Kiểm tra email đã tồn tại chưa
                    var checkMail = await _repo.GetByEmailAsync(dto.Email);
                    if (checkMail != null)
                    {
                        return ServiceResult<string>.Fail("Email đã tồn tại");
                    }

                    var newUser = new User()
                    {
                        FullName = dto.FullName,
                        Email = dto.Email,
                        Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                        Phone = dto.Phone,
                        DefaultAddress = dto.DefaultAddress,
                        JoinDate = dto.JoinDate,
                        Status = dto.Status,
                        RoleId = dto.RoleId,
                    };

                    var addedUser = await _repo.AddAsync(newUser);

                    // Nếu AddAsync thành công và trả về user, coi như thành công
                    if (addedUser != null)
                        return ServiceResult<string>.Ok("Người dùng đã được thêm thành công");

                    return ServiceResult<string>.Fail("Thêm người dùng thất bại");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return ServiceResult<string>.Fail("Có lỗi xảy ra: " + ex.Message);
                }
            }

        public Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
