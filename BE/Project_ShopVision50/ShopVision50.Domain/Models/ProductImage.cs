using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class ProductImage
    {
        [Key]
        public int ProductImageId { get; set; }
        [Required]
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
