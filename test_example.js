const { Database } = require('./database')

let myBase = Database.open('./test')

myBase.on('insert', (event) => {
    event.add('client', [
        {
            value:'test'
        },
        {
            value:true
        }
    ])
})

myBase.on('query', (event) => {
    let table = event.getTable('client')
    //console.log(table.getField('name'))
})

myBase.on('update', (event) => {

    let table = event.update('client', {
        isActive:true
    }, {
        isActive:false
    })
    
    console.log(table.json)
})