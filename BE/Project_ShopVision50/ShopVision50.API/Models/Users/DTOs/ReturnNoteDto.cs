using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ReturnNoteDto
    {
        [Key]
        public int ReturnNoteId { get; set; }
        public DateTime ReturnDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public bool Status { get; set; }
        public decimal TotalRefund { get; set; }

        public int OrderId { get; set; }
        public OrderDto Order { get; set; } = null!;

        public ICollection<ReturnItemDto>? ReturnItems { get; set; }
    }
}
