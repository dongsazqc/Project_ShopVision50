using ShopVision50.API.Repositories.TopCustomersRepo_FD;

namespace ShopVision50.API.Services.TopCustomersService_FD
{
    public class TopCustomersService : ITopCustomersService
    {
        private readonly ITopCustomersRepository _repo;

        public TopCustomersService(ITopCustomersRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<object>> GetTopCustomersAsync(int limit)
        {
            return await _repo.GetTopCustomersAsync(limit);
        }
    }
}
