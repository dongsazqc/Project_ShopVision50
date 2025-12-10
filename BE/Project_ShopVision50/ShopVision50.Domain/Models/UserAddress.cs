using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class UserAddress
    {
        [Key]
        public int AddressId { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AddressDetail { get; set; } = string.Empty;
        public bool IsDefault { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}