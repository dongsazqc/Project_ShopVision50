using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class OrderDto
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
        public UserDto User { get; set; } = null!;

        public ICollection<OrderItemDto>? OrderItems { get; set; }
        public ICollection<OrderPromotionDto>? OrderPromotions { get; set; }
        public ICollection<PaymentDto>? Payments { get; set; }
        public ICollection<ReturnNoteDto>? ReturnNotes { get; set; }
    }
}