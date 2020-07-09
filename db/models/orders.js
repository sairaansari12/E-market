/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    orderNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique:true,
       get() {
        return "ORDER00"+this.getDataValue('orderNo')
         } 
        
        },

  
     serviceDateTime: {
        type: DataTypes.DATE(),
        allowNull: false,
        
      },

    
orderPrice :
{ 
  type: DataTypes.STRING(15),
        allowNull: false,
},


  
promoCode :
{
  type: DataTypes.STRING(50),
        allowNull: true,
},


offerPrice :
{
  type: DataTypes.STRING(50),
        allowNull: true,
        default :'0'
},

serviceCharges :
{
  type: DataTypes.STRING(15),
        allowNull: false,
        default :'0'
},


totalOrderPrice :
{
  type: DataTypes.STRING(15),
   allowNull: false
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

    // 0->Not confirmed
    // 1->Confirmed
    // 2->cancelled by users
    // 3->cancelled by company
    // 4->PickUp
    // 5->dispatched
    // 6->arrived
    // 7->delivered  
//   progressStatus: {
//         type: DataTypes.INTEGER(11),
//         allowNull: false,
//         defaultValue: 0
//      },


//  trackStatus: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//         defaultValue: '',
//         get() {
//           return JSON.parse(this.getDataValue('trackStatus'))
  
//       },
//      },

    
// trackingLatitude:

// {
//     type: DataTypes.TEXT(),
//     allowNull: true,

// },

// trackingLongitude:

// {
//     type: DataTypes.TEXT(),
//     allowNull: true,

// },



    createdAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    
  }, {
    tableName: 'orders',
    timestamps: false
  });
};
