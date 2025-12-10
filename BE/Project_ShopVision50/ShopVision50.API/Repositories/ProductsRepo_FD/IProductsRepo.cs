using Shop_Db.Models;

namespace ShopVision50.API.Repositories.ProductsRepo_FD
{
    public interface IProductsRepo
    {
        Task <List<Product>> GetProductByNameAsync(string productsnyname); // Hợp đồng lấy sản phẩm theo tên sản phẩm
        Task AddProductAsync(Product product); // Hợp đồng thêm sản phẩm mới vào DB
        Task <List<Product>>GetAllProductsAsync();
        Task <Product> GetProductDetailAsync(int productId);
        Task DeleteProductsAsync(Product productid);
        Task UpdateProductAsync(Product product);
    }


}
