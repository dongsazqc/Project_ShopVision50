namespace ShopVision50.API.Repositories.TopProductsRepo_FD
{
    public interface ITopProductsRepository
    {
        Task<IEnumerable<object>> GetTopProductsAsync(int limit);
    }
}
