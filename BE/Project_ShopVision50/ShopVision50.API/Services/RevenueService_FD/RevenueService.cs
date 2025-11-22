    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using ShopVision50.API.Models.Users.DTOs;
    using ShopVision50.API.Repositories.RevenueSummary_FD;

    namespace ShopVision50.API.Services.RevenueService_FD
    {
       public class RevenueService : IRevenueService
{
    private readonly IRevenueSummaryRepo _revenueRepository;

    public RevenueService(IRevenueSummaryRepo revenueRepository)
    {
        _revenueRepository = revenueRepository;
    }

    public RevenueSummaryDto GetRevenueSummary(DateTime from, DateTime to)
    {
        return _revenueRepository.GetRevenueSummary(from, to);
    }
}

    }