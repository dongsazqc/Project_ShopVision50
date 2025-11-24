using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Login
{
    public class EmailDto
{
    public string Email { get; set; }
}

public class RegisterConfirmDto
{
    public string Email { get; set; }
    public string Otp { get; set; }
    public string Password { get; set; }
    public bool Status { get; set; }
    public string joinDate { get; set; }    
    public string Phone { get; set; }
    public string FullName { get; set; }
    public int RoleId { get; set; }
    public string DefaultAddress { get; set; }
}
}