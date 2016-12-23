var Message = require('../models/message')
var Device = require('../models/device')

module.exports = function(io) {

  const mqtt = require('mqtt')
  const mqttClient  = mqtt.connect('mqtt://192.168.0.35:1883')

  mqttClient.subscribe('/#')

  mqttClient.on('message', function (topic, message) {
    let data = JSON.parse(message.toString())

    Message.create({data: JSON.stringify(data)})
      .then(function(message) {
      io.emit('new.mqtt.message', message)
    })
      .catch(function(err) { console.error(err) })

    Device.findAll({ where: { mac: data.mac }})
      .then((devices) => {
      if(devices.length > 0) {
        Device.update({ip: devices[0].ip}, {where: {id: devices[0].id}})
          .then((rst) => {})
          .catch((err) => { console.error(err) })
      } else {
        Device.create({
          name: data.name, 
          mac: data.mac, 
          ip: data.ip,
        })
          .then((rst) => {
          Device.findAll()
            .then((devices) => { 
            io.emit('get.device', devices)
          })
            .catch((err) => { console.error(err) })
        })
          .catch((err) => { console.error(err) })
      }
    })
      .catch((err) => { console.error(err) })
  })

  // Client connection detected
  io.on('connection', (socket) => {

    require('../api/device')(socket)
    require('../api/message')(socket)
    require('../api/type')(socket)
    require('../api/location')(socket)

  })
}