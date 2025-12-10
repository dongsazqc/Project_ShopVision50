using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.ProductSizeRepo_FD;

namespace ShopVision50.API.Services.ProductSizeService_FD
{
    public class ProductSizeService : IProductSizeService
    {
        private readonly IProductSizeRepository _repo;

        public ProductSizeService(IProductSizeRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ProductSizeDto>> GetAllAsync()
        {
            var sizes = await _repo.GetAllAsync();
            return sizes.Select(s => new ProductSizeDto
            {
                SizeId = s.SizeId,
                Name = s.Name
            });
        }
    }
}
