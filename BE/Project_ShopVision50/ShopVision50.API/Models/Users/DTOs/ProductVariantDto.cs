using Shop_Db.Models;
using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductVariantDto
    {
        [Key]
        public int ProductVariantId { get; set; }

        public decimal SalePrice { get; set; }
        public int Stock { get; set; }

        public int? SizeId { get; set; }
        public ProductSizeDto? Size { get; set; }

        public int? ColorId { get; set; }
        public ProductColorDto? Color { get; set; }

        public int ProductId { get; set; }
        public ProductDto Product { get; set; } = null!;
        public ProductOrderDto ProductOrder { get; set; } = null!;



    }
}
