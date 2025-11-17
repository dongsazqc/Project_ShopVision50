namespace ShopVision50.API.Services.TopCustomersService_FD
{
    public interface ITopCustomersService
    {
        Task<IEnumerable<object>> GetTopCustomersAsync(int limit);
    }
}
