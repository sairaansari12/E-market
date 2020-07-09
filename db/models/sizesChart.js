/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sizesChart', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

 
    sizeName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

  
    

    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    

    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
    
    }
  }, {
    tableName: 'sizesChart',
    timestamps: false
  });
};
