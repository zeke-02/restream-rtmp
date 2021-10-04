// const { Sequelize, DataTypes, Model } = require('sequelize');

// // connections to reader and writer endpoints.
// const sequelizeWriter = new Sequelize(process.env.WriterEndpoint,{pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }});
// const sequelizeReader = new Sequelize(process.env.ReaderEndpoint, {pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }});

// // create user create db if not exist.
// class UserWrite extends Model {}
// class UserRead extends Model {}

// UserWrite.init({
//   // Model attributes are defined here
//   UID: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     primaryKey: true
//   },
//   youtube_key: {
//     type: DataTypes.STRING
//     // allowNull defaults to true
//   },
//   twitch_key: {
//     type: DataTypes.STRING
//   },
//   facebook_key: {
//     type: DataTypes.STRING
//   },
//   preferences: {
//     type: DataTypes.JSON
//   }
// }, {
//   // Other model options go here
//   sequelizeWriter, // We need to pass the connection instance
//   modelName: 'User', // We need to choose the model name
//   tableName: 'Users'
// });

// UserRead.init({
//     // Model attributes are defined here
//     firstName: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     lastName: {
//       type: DataTypes.STRING
//       // allowNull defaults to true
//     }
//   }, {
//     // Other model options go here
//     sequelizeWriter, // We need to pass the connection instance
//     modelName: 'User', // We need to choose the model name
//     tableName: 'Users'
//   });

// export {}

function isJson(item) {
  item = typeof item !== "string"
      ? JSON.stringify(item)
      : item;

  try {
      item = JSON.parse(item);
  } catch (e) {
      return false;
  }

  return false;
}

export { isJson }