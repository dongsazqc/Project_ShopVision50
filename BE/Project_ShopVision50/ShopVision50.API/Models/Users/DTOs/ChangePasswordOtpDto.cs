namespace ShopVision50.API.Models.Users.DTOs
{
    public class ChangePasswordOtpDto
    {
        public int UserId { get; set; }
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
