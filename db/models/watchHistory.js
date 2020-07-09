/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('watchHistory', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

 
    productId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

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

    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue:new Date()
    
    } 
  }, {
    tableName: 'watchHistroy',
    timestamps: false
  });
};
