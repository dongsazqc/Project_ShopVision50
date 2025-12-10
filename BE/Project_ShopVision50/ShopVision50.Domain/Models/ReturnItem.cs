using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class ReturnItem
    {
        [Key]
        public int ReturnItemId { get; set; }
        public int Quantity { get; set; }
        public string ReasonDetail { get; set; } = string.Empty;

        public int ProductVariantId { get; set; }
        public ProductVariant ProductVariant { get; set; } = null!;

        public int ReturnNoteId { get; set; }
        public ReturnNote ReturnNote { get; set; } = null!;
    }
}
