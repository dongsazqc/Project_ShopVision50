using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class Cart
    {
        [Key]
        public int CartId { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool Status { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<CartItem>? CartItems { get; set; }
    }
}