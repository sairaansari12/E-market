/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('assignedEmployees', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  

     rating :
     {
       type: DataTypes.STRING(15),
       allowNull: true,
        defaultValue: "0"
     },
     

     review :
     {
       type: DataTypes.TEXT(),
        allowNull: true,
        defaultValue: ""

     },

     empId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
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

    jobStatus: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
        defaultValue: 1
    },


    cancellationReason: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },


    otherReason: {
      type: DataTypes.TEXT(),
      allowNull: true,
    },
    
    ratingOn: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },


    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'assignedEmployees',
    timestamps: false
  });
};
