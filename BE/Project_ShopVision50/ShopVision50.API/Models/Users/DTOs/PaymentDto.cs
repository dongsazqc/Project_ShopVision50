using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class PaymentDto
    {
        [Key]
        public int PaymentId { get; set; }
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool Status { get; set; }
        public DateTime PaymentDate { get; set; }

        public int OrderId { get; set; }
        public OrderDto Order { get; set; } = null!;
    }
}
