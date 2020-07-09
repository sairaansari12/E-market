/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

    firstName: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true

    },


    lastName: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    email: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },


    countryCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    
    password: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false,

    },


    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    
    image: {
      type: DataTypes.STRING(100),
      allowNull: true,
      get() {
        if( this.getDataValue('image')!=null && this.getDataValue('image')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('image')
        else  return ""

    },
      defaultValue: ''
    },
	deviceToken:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },

	userType:{
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: 1
    },
	sessionToken:{
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ''
    },
	moduleType:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
	platform:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
	status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },
    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
};
