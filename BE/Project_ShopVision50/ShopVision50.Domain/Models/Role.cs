using System.ComponentModel.DataAnnotations;

namespace Shop_Db.Models
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        public string RoleName { get; set; } = string.Empty;

        public ICollection<User>? Users { get; set; }
        public ICollection<UserRole>? UserRoles { get; set; }
    }
}