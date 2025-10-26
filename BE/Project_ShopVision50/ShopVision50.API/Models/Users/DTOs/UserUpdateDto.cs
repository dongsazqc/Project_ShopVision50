using Microsoft.AspNetCore.Mvc;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class UserUpdateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? DefaultAddress { get; set; }
        public bool Status { get; set; } = true;
        public int? RoleId { get; set; }
    }
}

