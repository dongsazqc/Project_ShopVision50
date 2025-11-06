using System.Collections.Generic;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.StyleRepo_FD
{
    public interface IStyleRepo
    {
        Task<IEnumerable<Style>> GetAllAsync();
        Task<Style?> GetByIdAsync(int id);
        Task AddAsync(Style style);
        Task UpdateAsync(Style style);
        Task DeleteAsync(int id);
    }
}
