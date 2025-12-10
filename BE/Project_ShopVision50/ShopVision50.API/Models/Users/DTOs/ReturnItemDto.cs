using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopVision50.API.Models.Users.DTOs
{
    public class ReturnItemDto
    {
        [Key]
        public int ReturnItemId { get; set; }
        public int Quantity { get; set; }
        public string ReasonDetail { get; set; } = string.Empty;

        public int ProductVariantId { get; set; }
        public ProductVariantDto ProductVariant { get; set; } = null!;

        public int ReturnNoteId { get; set; }
        public ReturnNoteDto ReturnNote { get; set; } = null!;
    }
}
