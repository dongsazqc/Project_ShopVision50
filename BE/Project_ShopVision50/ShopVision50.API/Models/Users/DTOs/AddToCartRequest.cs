using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class AddToCartRequest
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

}