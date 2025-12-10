using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class UserAddressDto
    {
        [Key]
        public int AddressId { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AddressDetail { get; set; } = string.Empty;
        public bool IsDefault { get; set; }

        public int UserId { get; set; }
        public UserDto User { get; set; } = null!;
    }
}