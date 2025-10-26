using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class UserRoleDto
    {
        [Key]
        public int UserRoleId { get; set; }

        public int UserId { get; set; }
        public UserDto User { get; set; } = null!;

        public int RoleId { get; set; }
        public RoleDto Role { get; set; } = null!;
    }
}