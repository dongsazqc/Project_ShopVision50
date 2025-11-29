using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
   public class UserOrderResponse
{
    public int Id { get; set; }
    public DateTime DateOrdered { get; set; }
    public decimal AmountTotal { get; set; }
    public int OrderStatus { get; set; }
    public string ReceiverName { get; set; }
    public string ReceiverPhone { get; set; }
    public string DeliveryAddress { get; set; }
}

}