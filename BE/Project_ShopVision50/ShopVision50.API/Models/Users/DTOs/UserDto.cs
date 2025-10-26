using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class UserDto
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? DefaultAddress { get; set; }
        public DateTime JoinDate { get; set; }
        public bool Status { get; set; }

        public int? RoleId { get; set; }
        public RoleDto? Role { get; set; }

        public ICollection<CartDto>? Carts { get; set; }
        public ICollection<UserAddressDto>? Addresses { get; set; }
        public ICollection<OrderDto>? Orders { get; set; }
        public ICollection<UserRoleDto>? UserRoles { get; set; }
    }

}
