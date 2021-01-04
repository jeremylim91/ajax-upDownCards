import pkg from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';
import userModel from './user.mjs';
import gameModel from './game.mjs';

const { Sequelize } = pkg;

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

let sequelize;

if (env === 'production') {
  // break apart the Heroku database url and rebuild the configs we need

  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);

  const host = dbUrl.hostname;
  const { port } = dbUrl;

  config.host = host;
  config.port = port;

  sequelize = new Sequelize(dbName, username, password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.user = userModel(sequelize, Sequelize.DataTypes);
db.game = gameModel(sequelize, Sequelize.DataTypes);
// db.GamesUser = gamesUserModel(sequelize, Sequelize.DataTypes);

// in order for the many-to-many to work we must mention the join table here.
// many to many r/s
db.user.belongsToMany(db.game, { through: 'gameUsers' });
db.game.belongsToMany(db.user, { through: 'gameUsers' });

// one-to-many r/s
// db.User.hasMany(db.GamesUser);
// db.GamesUser.belongsTo(db.User);

// db.Game.hasMany(db.GamesUser);
// db.GamesUser.belongsTo(db.Game);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
