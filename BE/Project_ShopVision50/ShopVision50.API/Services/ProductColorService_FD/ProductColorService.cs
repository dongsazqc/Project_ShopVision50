using ShopVision50.API.Models.Users.DTOs;
using ShopVision50.API.Repositories.ProductColorRepo_FD;

namespace ShopVision50.API.Services.ProductColorService_FD
{
    public class ProductColorService : IProductColorService
    {
        private readonly IProductColorRepository _repo;

        public ProductColorService(IProductColorRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ProductColorDto>> GetAllAsync()
        {
            var colors = await _repo.GetAllAsync();

            // Map Model -> DTO
            return colors.Select(c => new ProductColorDto
            {
                ColorId = c.ColorId,
                Name = c.Name
            });
        }
    }
}
