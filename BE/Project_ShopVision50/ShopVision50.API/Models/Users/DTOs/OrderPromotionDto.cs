using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class OrderPromotionDto
    {
        [Key]
        public int OrderPromotionId { get; set; }

        public int OrderId { get; set; }
        public OrderDto Order { get; set; } = null!;

        public int PromotionId { get; set; }
        public PromotionDto Promotion { get; set; } = null!;
    }
}
    