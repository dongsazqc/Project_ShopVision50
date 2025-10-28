using Shop_Db.Models;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductDto
    {

        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Brand { get; set; }
        public string Warranty { get; set; }
        public bool Status { get; set; }
        public MaterialDto Material { get; set; }
        public StyleDto Style { get; set; }

    }
}
