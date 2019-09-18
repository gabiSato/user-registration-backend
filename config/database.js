const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/user-registration", { useNewUrlParser: true })

mongoose.connection.on('connected', () => console.log('Conectado ao banco de dados'))

mongoose.connection.on('error', err => console.log(err))

mongoose.connection.on('disconnect', () => console.log('Desconectado'))