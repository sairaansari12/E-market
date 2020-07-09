/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('suborders', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  
  
     serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
     },

     color: {
      type: DataTypes.STRING(100),
      allowNull: false,
     defaultValue:''
    },
 
    size: {
      type: DataTypes.STRING(100),
      allowNull: false,
     defaultValue:''
    },

     quantity :
     {
       type: DataTypes.STRING(15),
        allowNull: false
     },

     serviceCharges :
     {
       type: DataTypes.FLOAT(10),
        allowNull: false,
        defaultValue:0
     },


     addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'address',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
   },


     
   companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
     },
     onUpdate: 'CASCADE',
     onDelete: 'CASCADE',
  },


     userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },



    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },

   

 progressStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
   },


trackStatus: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      get() {
        if(this.getDataValue('trackStatus')!="") return JSON.parse(this.getDataValue('trackStatus'))
else return []
    },
   },

   serviceCharges :
   {
     type: DataTypes.FLOAT(10),
      allowNull: false,
      defaultValue:0
   },
   
   
   estimateDelivery :
   {
     type: DataTypes.TEXT(),
      allowNull: false,
      defaultValue:0
   },
   




  
trackingLatitude:

{
  type: DataTypes.TEXT(),
  allowNull: true,

},

trackingLongitude:

{
  type: DataTypes.TEXT(),
  allowNull: true,

},

cancellationReason:

{
  type: DataTypes.STRING(100),
  allowNull: true,

},

otherReason: {
  type: DataTypes.TEXT,
  allowNull: true,
},




 createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue:new Date()
    },

  
  }, {
    tableName: 'suborders',
    timestamps: false
  });
};
