using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IUserService
    {
        // Lấy danh sách user (ẩn password, không include quan hệ)
        Task<ServiceResult<List<UserDto>>> GetAllUsersAsyncSer();

        // Lấy chi tiết user (include đầy đủ quan hệ, JSON shape đúng format bạn yêu cầu)
        Task<ServiceResult<object>> GetUserByIdAsync(int id);

        // Đăng ký user (dùng chung cho Auth + Users)
        Task<ServiceResult<UserDto>> RegisterUserAsync(UserDto dto);

        // Cập nhật user (ẩn password khi trả về)
        Task<ServiceResult<UserDto>> UpdateUserAsync(int id, UserDto dto);

        // Xóa user
        Task<ServiceResult<bool>> DeleteUserAsync(int id);
    }
}
