using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Shop_Db.Models;
namespace ShopVision50.API.Repositories.ProductVariantsRepo_FD
{
    public interface IProductVariantsRepo
    {
        
        Task<IEnumerable<ProductVariant>> GetAllAsync();
        Task<ProductVariant?> GetByIdAsync(int id);
        Task AddAsync(ProductVariant variant);
        Task UpdateAsync(ProductVariant variant);
        Task DeleteAsync(int id);
    }
}