namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductDto
    {

        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
