/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productSpecifications', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

 
    productColor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

  
    productImages: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('productImages')!="")
        {
          var images=this.getDataValue('productImages').split(",")
          imageArray=[];
          for(var k=0;k<images.length;k++)
          {
            imageArray.push( config.IMAGE_APPEND_URL+"services/icons/"+images[k]);
          }
          return  imageArray;
        }
        else return ""

    },
      defaultValue: ""
    },


    stockQunatity: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        return JSON.parse(this.getDataValue('stockQunatity'))

    },
    },
  

    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
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
    tableName: 'productSpecifications',
    timestamps: false
  });
};
