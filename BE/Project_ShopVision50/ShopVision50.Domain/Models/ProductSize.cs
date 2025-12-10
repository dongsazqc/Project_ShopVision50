using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class ProductSize
    {
        [Key]
        public int SizeId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

        public ICollection<ProductVariant>? ProductVariants { get; set; }
    }
}
