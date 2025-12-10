using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public decimal TotalAmount { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public string RecipientPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;

        //cái này để biết xem đơn hàng đã thanh toán hay chưa

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<OrderPromotion> OrderPromotions { get; set; } = new List<OrderPromotion>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<ReturnNote> ReturnNotes { get; set; } = new List<ReturnNote>();
    }
}
public enum OrderStatus
{
    Pending = 0,
    Processing = 1,
    Shipping = 2,
    Completed = 3,
    Cancelled = 4,
    Returned = 5
}
