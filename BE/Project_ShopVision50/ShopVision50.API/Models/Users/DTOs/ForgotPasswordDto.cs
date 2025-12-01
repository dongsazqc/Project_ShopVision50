namespace ShopVision50.API.Models.Users.DTOs
{
    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}
