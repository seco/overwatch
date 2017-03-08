const errorHandler = require('./errorHandler')
const Device = require('../models/device')
const Type = require('../models/type')
const Location = require('../models/location')
const Message = require('../models/message')

module.exports = function(socket) {

    socket.on('device.getAll', (data) => {
        let options = {
            include: [ Type, Location, Message ],
            where: {}
        }
        if(data.untype) { options.where = { type: null} }
        Device.findAll(options)
            .then((devices) => { 
            socket.emit('device.getAll.result', devices)
        }).catch((err) => {
            socket.emit('device.getAll.error', new errorHandler(err))
        })
    })

    socket.on('device.update', (data) => {
        Device.findById(data.id).then((device) => {
            let types = []
            data.types.forEach((type) => { types.push(type.id) })
            device.setTypes(types).then(() => {                
                device.setLocation(data.locationId)
                Device.update({
                    name: data.name,
                    mac: data.mac,
                    ip: data.ip,
                }, { where: { id: data.id } })
                    .then((count, device) => {
                    this.socket.emit('device.update.result', {count: count, device: device})
                }).catch((err) => { 
                    socket.emit('device.getAll.error', new errorHandler(err))
                })
            }).catch((err) => { 
                socket.emit('device.getAll.error', new errorHandler(err))
            })
        }).catch((err) => { 
            socket.emit('device.getAll.error', new errorHandler(err))
        })
    })

    socket.on('device.remove', (data) => {
        Device.destroy({ where: { id: data.id }})
            .then((rst) => {
            socket.emit('device.remove.result', {result: rst}) 
        }).catch((err) => { 
            socket.emit('device.remove.error', new errorHandler(err))
        })
    })

    socket.on('device.removeAll', () => {
        Device.destroy({where: {}})
            .then((rst) => {
            socket.emit('device.removeAll.result', {result: rst})
        }).catch((err) => { 
            socket.emit('device.removeAll.error', new errorHandler(err))
        })
    })
}