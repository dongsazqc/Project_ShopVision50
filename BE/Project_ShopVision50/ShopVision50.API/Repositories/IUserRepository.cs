using Shop_Db.Models;

namespace ShopVision50.API.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task AddAsync(User user);
    }
}
