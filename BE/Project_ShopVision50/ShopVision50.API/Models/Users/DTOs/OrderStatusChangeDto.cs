namespace ShopVision50.API.Models.Users.DTOs
{
    public class OrderStatusChangeDto
    {
        public int OrderId { get; set; }
        public string NewStatus { get; set; } = string.Empty;
    }
}
