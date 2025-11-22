using ShopVision50.API.Repositories.TopProductsRepo_FD;

namespace ShopVision50.API.Services.TopProductsService_FD
{
    public class TopProductsService : ITopProductsService
    {
        private readonly ITopProductsRepository _repo;

        public TopProductsService(ITopProductsRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<object>> GetTopProductsAsync(int limit)
        {
            return await _repo.GetTopProductsAsync(limit);
        }
    }
}
