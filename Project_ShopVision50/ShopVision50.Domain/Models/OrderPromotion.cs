using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class OrderPromotion
    {
        [Key]
        public int OrderPromotionId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int PromotionId { get; set; }
        public Promotion Promotion { get; set; } = null!;
    }
}
