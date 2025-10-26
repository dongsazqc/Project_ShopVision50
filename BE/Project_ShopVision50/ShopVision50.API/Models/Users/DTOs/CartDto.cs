using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class CartDto
    {
        [Key]
        public int CartId { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool Status { get; set; }

        public int UserId { get; set; }
        public UserDto User { get; set; } = null!;

        public ICollection<CartItemDto>? CartItems { get; set; }
    }
}