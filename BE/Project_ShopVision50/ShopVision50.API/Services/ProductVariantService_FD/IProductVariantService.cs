using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.API.Services.ProductVariantService_FD
{
    public interface IProductVariantService
    {
        Task<IEnumerable<ProductVariant>> GetAllAsync();
        Task<IEnumerable<ProductVariant>> GetByIdAsync(int ProductId);
        Task<bool> CreateAsync(ProductVariant variant);
        //Task<bool> UpdateAsync(ProductVariant variant);
        Task<bool> DeleteAsync(int id);
    }
}