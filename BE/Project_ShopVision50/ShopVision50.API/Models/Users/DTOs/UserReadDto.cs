using Microsoft.AspNetCore.Mvc;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class UserReadDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool Status { get; set; }
        public DateTime JoinDate { get; set; }
        public int? RoleId { get; set; }
        public string? DefaultAddress { get; set; }
    }
}
