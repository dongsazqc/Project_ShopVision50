using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class UserRole
    {
        [Key]
        public int UserRoleId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}