/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companies', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },


    parentId: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
    },

    companyName: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
  },

  password: {
    type: DataTypes.STRING(256),
    allowNull: false,
},

phoneNumber: {
  type: DataTypes.STRING(20),
},

countryCode: {
  type: DataTypes.STRING(20),
},

//2 -Companies , 1-Super Admin
role: {
  type: DataTypes.INTEGER(10),
  default:2
},


logo1: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo1')!=null && this.getDataValue('logo1')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo1')
    },
      defaultValue: ''
},

logo2: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo2')!=null && this.getDataValue('logo2')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo2')
    },
      defaultValue: ''
},


logo3: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo3')!=null && this.getDataValue('logo3')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo3')
    },
      defaultValue: ''
},


status: {
  type: DataTypes.INTEGER(11),
  allowNull: false,
  defaultValue: 1
},

address1: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

address1LatLong: {
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: ""
},


address2LatLong: {
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: ""
},

address2: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

websiteLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},




createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    },
    updatedAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    }
  }, {
    tableName: 'companies',
    timestamps: false
  });
};
