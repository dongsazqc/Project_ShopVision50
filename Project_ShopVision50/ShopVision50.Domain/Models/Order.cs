using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public bool Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string RecipientPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<OrderItem>? OrderItems { get; set; }
        public ICollection<OrderPromotion>? OrderPromotions { get; set; }
        public ICollection<Payment>? Payments { get; set; }
        public ICollection<ReturnNote>? ReturnNotes { get; set; }
    }
}