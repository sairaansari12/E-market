/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ratings', {
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


     reviewImages: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('reviewImages')!="")
        {
          var images=this.getDataValue('reviewImages').split(",")
          imageArray=[];
          for(var k=0;k<images.length;k++)
          {
            imageArray.push( config.IMAGE_APPEND_URL+"reviews/"+images[k]);
          }
          return  imageArray;
        }
        else return []

    },
      defaultValue: ""
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
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue:'',
     
    },

   

    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'ratings',
    timestamps: false
  });
};
