using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Repositories.ProductVariantsRepo_FD;

namespace ShopVision50.API.Services.ProductVariantService_FD
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly IProductVariantsRepo _repository;
        public ProductVariantService(IProductVariantsRepo repo)
        {
            _repository = repo ;
        }

        public async Task<bool> CreateAsync(ProductVariant variant)
        {
                 await _repository.AddAsync(variant);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
                        return true;        }

        public async Task<IEnumerable<ProductVariant>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ProductVariant?> GetByIdAsync(int id)
        {
             return await _repository.GetByIdAsync(id);
        }

        public async Task<bool> UpdateAsync(ProductVariant variant)
        {
            var existing = await _repository.GetByIdAsync(variant.ProductVariantId);
            if (existing == null) return false;

            existing.SalePrice = variant.SalePrice;
            existing.Stock = variant.Stock;
            existing.SizeId = variant.SizeId;
            existing.ColorId = variant.ColorId;
            existing.ProductId = variant.ProductId; 

            await _repository.UpdateAsync(existing);
            return true;

        }
    }
}