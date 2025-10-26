using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class PromotionDto
    {
        [Key]
        public int PromotionId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty; // percent/fixed
        public decimal DiscountValue { get; set; }
        public string? Condition { get; set; }
        public string? Scope { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool Status { get; set; }

        public ICollection<OrderItemDto>? OrderItems { get; set; }
        public ICollection<OrderPromotionDto>? OrderPromotions { get; set; }
    }
}
