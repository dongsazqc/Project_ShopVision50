using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.Login_FD
{
    public interface ILoginService
    {
        Task<ServiceResult<User>> AuthenticateUserAsync(string email, string password, bool isClientLogin = false);
    }
}