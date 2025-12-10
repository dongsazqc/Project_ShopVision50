using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class ReturnNote
    {
        [Key]
        public int ReturnNoteId { get; set; }
        public DateTime ReturnDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public bool Status { get; set; }
        public decimal TotalRefund { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public ICollection<ReturnItem>? ReturnItems { get; set; }
    }
}
