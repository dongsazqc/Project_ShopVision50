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
    Task<IEnumerable<ProductVariant>> GetByProductIdAsync(int productId);
    Task<ProductColor?> GetColorByNameAsync(string tenMau);
    Task<ProductSize?> GetSizeByNameAsync(string tenKichCo);
    Task<Product?> GetProductByIdAsync(int productId);
    Task AddAsync(ProductVariant variant);
    Task SaveChangesAsync();
     
    }
}