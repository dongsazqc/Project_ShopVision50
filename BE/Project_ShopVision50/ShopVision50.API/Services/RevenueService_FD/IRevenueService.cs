using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ShopVision50.API.Models.Users.DTOs;

namespace ShopVision50.API.Services.RevenueService_FD
{
    public interface IRevenueService
    {
        RevenueSummaryDto GetRevenueSummary(DateTime from, DateTime to);
    }
}