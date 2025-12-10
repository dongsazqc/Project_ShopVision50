using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Repositories.ProductImageRepo_FD
{
    public interface IProductImageRepository
    {
    Task<List<ProductImage>> GetByProductIdWithRelationsAsync(int productId);
    Task AddAsync(ProductImage image);
    // IProductImageRepository
    Task<ProductImage?> GetByIdAsync(int imageId);
    void Remove(ProductImage image);
    Task SaveChangesAsync();
}
    }
