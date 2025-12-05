using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class ProductVariant
    {
        [Key]
        public int ProductVariantId { get; set; }

        public decimal SalePrice { get; set; }
        public int Stock { get; set; }

        public int? SizeId { get; set; }
        public virtual ProductSize? Size { get; set; }

        public int? ColorId { get; set; }
        public virtual ProductColor? Color { get; set; }

        public int ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public ICollection<CartItem>? CartItems { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
        public ICollection<ReturnItem>? ReturnItems { get; set; }

    
        
    }
}
