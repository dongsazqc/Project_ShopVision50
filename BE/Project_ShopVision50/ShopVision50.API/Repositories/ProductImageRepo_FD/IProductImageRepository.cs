using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.ProductImageRepo_FD
{
    public interface IProductImageRepository
    {
   Task AddAsync(ProductImage image);
     Task<IEnumerable<ProductImage>> GetByProductIdAsync(int productId);
    Task SaveChangesAsync();
}
    }
