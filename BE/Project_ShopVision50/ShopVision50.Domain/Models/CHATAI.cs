using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVision50.Domain.Models
{
    public class CHATAI
    {
         [Key]
         public int Id { get; set; }  
        public string UserId {get ;set ;}
        public string CauHoi {  get ; set;}
         public string Cautraloi {get;set;}
    }
}