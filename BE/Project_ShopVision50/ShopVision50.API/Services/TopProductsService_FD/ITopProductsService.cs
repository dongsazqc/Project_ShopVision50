namespace ShopVision50.API.Services.TopProductsService_FD
{
    public interface ITopProductsService
    {
        Task<IEnumerable<object>> GetTopProductsAsync(int limit);
    }
}
