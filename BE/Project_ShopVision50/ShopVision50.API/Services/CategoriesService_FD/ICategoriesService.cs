using Shop_Db.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.CategoriesService_FD
{
    public interface ICategoriesService
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(int id);
    }
}
