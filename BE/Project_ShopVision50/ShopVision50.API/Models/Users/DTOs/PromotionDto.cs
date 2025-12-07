using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class PromotionDto
{
    [Key]
    public int PromotionId { get; set; }

    public string Code { get; set; } = string.Empty;

    public string DiscountType { get; set; } = string.Empty; // percent/fixed

    public decimal DiscountValue { get; set; }

    // Property helper để hiển thị ra API, không map xuống DB
public string DiscountDisplay
{
    get
    {
        if (DiscountType.ToLower() == "percent")
            return $"{Decimal.Round(DiscountValue, 0)}%";
        else
            return $"{DiscountValue:N0} VND";
    }
}
    public string? Condition { get; set; }

    public string? Scope { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool Status { get; set; }

    public ICollection<OrderItemDto>? OrderItems { get; set; }

    public ICollection<OrderPromotionDto>? OrderPromotions { get; set; }
}

}
