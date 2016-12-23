var Sequelize = require('sequelize')
var sequelize = require('../db/database')
var Type = require('./type')
var Location = require('./location')

var Device = sequelize.define('device', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.STRING,
    mac: Sequelize.STRING,
    ip: Sequelize.STRING,
}, { freezeTableName: true })

Device.hasOne(Type)
Device.hasOne(Location)

module.exports = Device