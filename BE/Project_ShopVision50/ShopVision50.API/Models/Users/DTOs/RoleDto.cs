using System.ComponentModel.DataAnnotations;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class RoleDto
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        public string RoleName { get; set; } = string.Empty;

        public ICollection<UserDto>? Users { get; set; }
        public ICollection<UserRoleDto>? UserRoles { get; set; }
    }
}