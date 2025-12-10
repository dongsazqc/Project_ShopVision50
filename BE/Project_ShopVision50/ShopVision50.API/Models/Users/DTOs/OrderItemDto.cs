using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class OrderItemDto
    {
        [Key]
        public int OrderItemId { get; set; }
        public int Quantity { get; set; }
        public decimal DiscountAmount { get; set; }

        public int ProductVariantId { get; set; }
        public ProductVariantDto ProductVariant { get; set; } = null!;

        public int OrderId { get; set; }
        public PromotionDto? Promotion { get; set; }
    }
}
