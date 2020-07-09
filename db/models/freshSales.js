/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('freshSales', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

 
    categoryId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

  

    saleName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

    saleDesc: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },

    saleImage: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('saleImage')!="")
        return config.IMAGE_APPEND_URL+"services/sales/"+this.getDataValue('saleImage')
        else return ""
    },
     
      defaultValue: ""
    },


    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue:new Date()
    
    } 
  }, {
    tableName: 'freshSales',
    timestamps: false
  });
};
