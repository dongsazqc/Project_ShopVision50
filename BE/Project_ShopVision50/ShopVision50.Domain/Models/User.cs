using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class User
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
        public Role? Role { get; set; }

        public ICollection<Cart>? Carts { get; set; }
        public ICollection<UserAddress>? Addresses { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public ICollection<UserRole>? UserRoles { get; set; }
    }

}

