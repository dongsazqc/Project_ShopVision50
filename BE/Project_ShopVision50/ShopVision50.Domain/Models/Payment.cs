using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool Status { get; set; }
        public DateTime PaymentDate { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }
}
