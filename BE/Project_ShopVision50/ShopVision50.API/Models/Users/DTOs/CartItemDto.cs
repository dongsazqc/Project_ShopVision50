using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
public class CartItemDto
{
    public int CartItemId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int ProductVariantId { get; set; }
    public int CartId { get; set; }
    public ProductVariantDto ProductVariant { get; set; }
}
}
