using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class CartItem
    {
        [Key]
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        public int ProductVariantId { get; set; }
        public ProductVariant ProductVariant { get; set; } = null!;

        public int CartId { get; set; }
        public Cart Cart { get; set; } = null!;
    }
}
