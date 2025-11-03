using Shop_Db.Models;

namespace ShopVision50.API.Repositories.CategoriesRepo_FD
{
    public interface ICategoriesReposirory
    {
        
         Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(int id);
    
    }
}
