using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class CreateOrderRequest
{
    public DateTime OrderDate { get; set; }
    public string OrderType { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public OrderStatus Status {get ; set;}
    public string Salesperson { get; set; } = string.Empty;

    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;

    public List<OrderItemRequest> OrderItems { get; set; } = new();

    public List<PaymentDetail> Payments { get; set; } = new();
    public int UserId { get; set; }
    public string? PromoCode { get; set; }
    public decimal TotalAmount { get; set; }
}

public class OrderItemRequest
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
}

public class PaymentDetail
{
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal CashReceived { get; set; }
    public decimal CashChange { get; set; }
}

}