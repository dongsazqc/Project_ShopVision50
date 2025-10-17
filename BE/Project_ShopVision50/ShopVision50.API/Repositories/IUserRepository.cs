using Shop_Db.Models;
// Cái này là hợp đông hay còn gọi lfa interface 

//Nó không làm gì cả, chỉ bảo “bất kỳ class nào là IUserRepository thì phải có 2 hàm này”.

//Lợi ích: Ta có thể thay Repo khác mà không cần đổi code Service, chỉ cần implement interface này là ok.

namespace ShopVision50.API.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username); // Hàm lấy user theo username/email ( chủ yếu dùng để tìm user hoặc check xem user đã tồn tại chuua
        Task AddregisteredAsync(User user);       // Hàm thêm user mới vào DB - Tên thôi chưa thực hiện logic gì đâu nhé 
        Task<List<User>> GetAllUsersAsyncRepo();
    }
}
