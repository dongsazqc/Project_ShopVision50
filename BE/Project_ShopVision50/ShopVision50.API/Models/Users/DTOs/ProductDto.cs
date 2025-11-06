using System.ComponentModel.DataAnnotations;
using Shop_Db.Models;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductDto
    {

        [Key]
        public int ProductId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Brand { get; set; }
        public string? Warranty { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool Status { get; set; }

        // FKs
        public int? MaterialId { get; set; }
        public Material? Material { get; set; }

        public int? StyleId { get; set; }
        public Style? Style { get; set; }

        public int? GenderId { get; set; }
        public Gender? Gender { get; set; }

        public int? OriginId { get; set; }
        public Origin? Origin { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public ICollection<ProductVariant>? ProductVariants { get; set; }
        public ICollection<ProductImage>? ProductImages { get; set; }
    }
    
}
