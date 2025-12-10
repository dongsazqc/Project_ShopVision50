namespace ShopVision50.API.Repositories.TopCustomersRepo_FD
{
    public interface ITopCustomersRepository
    {
        Task<IEnumerable<object>> GetTopCustomersAsync(int limit);
    }
}
