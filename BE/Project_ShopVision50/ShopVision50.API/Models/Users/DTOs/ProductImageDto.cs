using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ProductImageDto
    {
        [Key]
        public int ProductImageId { get; set; }
        [Required]
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public int Stock { get; set; }

        public int ProductId { get; set; }
        public ProductDto Product { get; set; } = null!;
    }
}
