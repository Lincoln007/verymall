//------------------------------------------------------------------------------
// <auto-generated>
//     此代码已从模板生成。
//
//     手动更改此文件可能导致应用程序出现意外的行为。
//     如果重新生成代码，将覆盖对此文件的手动更改。
// </auto-generated>
//------------------------------------------------------------------------------

namespace Himall.Model
{
    using System;
    using System.Collections.Generic;
    
    public partial class ShopBonusGrantInfo:BaseModel
    {
        public ShopBonusGrantInfo()
        {
            this.Himall_ShopBonusReceive = new HashSet<ShopBonusReceiveInfo>();
        }
    
        long _id;
        public new long Id { get{ return _id; } set{ _id=value; base.Id = value; } }
        public long ShopBonusId { get; set; }
        public long UserId { get; set; }
        public long OrderId { get; set; }
        public string BonusQR { get; set; }
    
        public virtual UserMemberInfo Himall_Members { get; set; }
        public virtual ShopBonusInfo Himall_ShopBonus { get; set; }
        public virtual ICollection<ShopBonusReceiveInfo> Himall_ShopBonusReceive { get; set; }
    }
}