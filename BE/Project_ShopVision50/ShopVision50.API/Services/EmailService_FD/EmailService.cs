using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;
using ShopVision50.API.Services.UserService_FD;

namespace ShopVision50.API.Services
{
   public class EmailService : IEmailService
{
    private readonly string _smtpServer = "smtp.gmail.com";
    private readonly int _smtpPort = 587;
    private readonly string _smtpUser = "dong0705451521@gmail.com"; 
    private readonly string _smtpPass = "jvskomsxlrcyboej"; 

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_smtpUser));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Plain) { Text = body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_smtpUser, _smtpPass);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
}