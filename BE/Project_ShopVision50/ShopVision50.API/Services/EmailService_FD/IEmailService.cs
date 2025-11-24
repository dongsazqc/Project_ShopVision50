using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.API.Services.UserService_FD
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}