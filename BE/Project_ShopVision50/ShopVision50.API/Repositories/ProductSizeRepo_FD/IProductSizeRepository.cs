using Shop_Db.Models;

namespace ShopVision50.API.Repositories.ProductSizeRepo_FD
{
    public interface IProductSizeRepository
    {
        Task<IEnumerable<ProductSize>> GetAllAsync();
    }
}
