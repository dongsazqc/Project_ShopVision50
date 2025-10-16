using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shop_Db.Models
{
    public class Style
    {
        [Key]
        public int StyleId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

        public ICollection<Product>? Products
        {
            get; set;
        }
        }
}
