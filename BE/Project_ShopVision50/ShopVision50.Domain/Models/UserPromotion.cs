using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;

namespace ShopVision50.Domain.Models
{
   public class UserPromotion
{
    public int UserPromotionId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int PromotionId { get; set; }
    public Promotion Promotion { get; set; }

    public bool IsUsed { get; set; } = false;
    public DateTime? UsedAt { get; set; }
}

}