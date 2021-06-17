const { Database } = require('./database')

let myBase = new Database({
    config:{
        name: 'test',
        path: './test'
    }
})

myBase.on('create', (event) => {
    event.add('client', [
        {
            name: 'name',
            type: 'string',
            size: 128
        },
        {
            name: 'isActive',
            type: 'boolean'
        }
    ])
})

myBase.on('insert', (event) => {
    event.add('client', [
        {
            value: 'Thomas'
        },
        {
            value: true
        }
    ])
})