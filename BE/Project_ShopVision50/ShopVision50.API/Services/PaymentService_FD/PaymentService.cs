using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shop_Db.Models;
using ShopVision50.API.Repositories.PaymentRepository;

namespace ShopVision50.API.Services.PaymentService_FD
{
   public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<List<Payment>> GetAllAsync()
    {
        return await _paymentRepository.GetAllAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _paymentRepository.GetByIdAsync(id);
    }

    public async Task AddAsync(Payment payment)
    {
        await _paymentRepository.AddAsync(payment);
        await _paymentRepository.SaveChangesAsync();
    }

    public async Task UpdateAsync(Payment payment)
    {
        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);
        if (payment == null) throw new Exception("Payment not found");

        _paymentRepository.Delete(payment);
        await _paymentRepository.SaveChangesAsync();
    }
}

}