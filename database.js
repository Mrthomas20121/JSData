const fs = require('fs')
const events = require('events')
const { encrypt, decrypt } = require('./content/encryption')
const { Table } = require('./content/table')

class Database {
    
    config = {
        path: {
            base:''
        },
        name: ''
    }

    data = {
        tables: {

        }
    }

    MAX_INT_SIZE = Number.MAX_SAFE_INTEGER

    /**
     * Create a Database
     * @param { { path:{ base:string},name:string,format?:'json'|'jsdata' } } config
     */
    constructor(config={}) {
        this.format = config.hasOwnProperty('format') ? config.format : 'jsdata'
        this.emitter = new events.EventEmitter()
        let converted_path = ""

        if(config == {}) {
            this.config.path.base = `%appdata%/JSData/database/${this.config.name}`
            converted_path = replaceArgs(this.config.path.base)
        }
        else {
            this.config = config
            converted_path = replaceArgs(this.config.path.base)
            if(fs.existsSync(`${converted_path}/data.${this.format}`)) {
                let data = readFile(`${converted_path}/data.${this.format}`)
                this.data = data
            }
        }
        
        if(!fs.existsSync(converted_path)) fs.mkdirSync(converted_path)
    }

    /**
     * @param {'create'|'insert'|'delete'|'update'|'config' | 'query'} eventName
     * @param {(event:{ ConditionBuilder:ConditionBuilder, database_name:string,update?:(table_name:string, original_value:{} field:{}) => Table,getTable?:Table,add?:(table_name:string, data:[{ name:string,type:name,size?:Number }] | [{ value:string }]) => void }) => void} callback 
     */
    on(eventName, callback) {
        if(['create', 'insert', 'delete', 'update', 'config', 'query'].includes(eventName)) {
            this.emitter.on(eventName, callback)

            let evt = {
                database_name:this.config.name,
            } 
            
            if(eventName == 'create') evt.add = (table_name, data) => {
                data.forEach((value, index, arr) => {
                    if(value.type == 'boolean') arr[index].size = 4
                    if(value.type == 'int') arr[index].size = this.MAX_INT_SIZE
                })
                this.data.tables[table_name] = {
                    data:data,
                    values:[]
                }
                this.save()
            }

            if(eventName == 'insert') evt.add = (table_name, content) => {
                let data = this.data.tables[table_name].data
                let values = this.data.tables[table_name].values
                if(data.length != content.length) return;
        
                let match = true
                let errorMsg = ''
        
                for(let i = 0; i<data.length; i++) {
                    if(typeof content[i].value != data[i].type) {
                        match = false
                        errorMsg = `Error, ${content[i].value} does not match the type of the col`
                        break;
                    }
                    else if(!lessThan(content[i].value, data[i].size)) {
                        match = false
                        errorMsg = `Error, field ${content[i].value} is too big, it should be less than or equal ${data[i].size}`
                        break;
                    }
                }
                if(match) values.push(content)
                else throw new Error(errorMsg)
                
                this.save()
            }
            
            if(eventName == 'query') {
                /**
                 * @param {string} table_name
                 * @return {Table} 
                 */
                evt.getTable = (table_name) => {
                    return new Table(table_name, this.data.tables[table_name])
                }
            }

            if(eventName == 'update') {
                /**
                 * Update a table data
                 * @param {string} table_name
                 * @param {Object} original_value 
                 * @param {Object} field 
                 */
                evt.update = (table_name, original_value={}, field={}) => {

                    // filter the elements to get the matching fields
                    let fields = this.data.tables[table_name].data.filter((value) => field.hasOwnProperty(value.name))
                    
                    // for each field use the index of that field to edit the value if it.
                    for(let f of fields) {
                        let name = f.name
                        let index = this.data.tables[table_name].data.findIndex((value) => value.name == name)

                        // we're making sure the index is not -1
                        if(index > -1) {
                            let value = this.data.tables[table_name].values.findIndex((value) => value[index].value == original_value[name])
                            
                            if(value > -1) this.data.tables[table_name].values[value][index].value = field[name]
                        }
                    }

                    // save
                    this.save()

                    // return a table
                    return new Table(table_name, this.data.tables[table_name])
                }
            }

            this.emitter.emit(eventName, evt)
        }
    }

    /**
     * Save the database content
     */
    save() {
        writeFile(`${this.config.path.base}/config.jsdata`, this.config)
        writeFile(`${this.config.path.base}/data.${this.format}`, this.data)
    }

    /**
     * Open a existing Database
     * @param {string} path Database path
     */
    static open(path) {
        let config = readFile(`${replaceArgs(path)}/config.jsdata`)
        let base = new Database(config)
        return base
    }
}

/**
 * Check if a less than or equal b.
 * @param {any} a 
 * @param {number} b 
 */
function lessThan(a, b) {
    let c = false
    if(Number.isInteger(a)) c = a<=b
    else if(typeof a == 'string') c = a.length<=b
    else if(typeof a == 'boolean') c = true
    return c
}

/**
 * @param {string} file
 * @return { Object } JSON
 */
function readFile(file) {
    if(file.endsWith('jsdata')) return JSON.parse(decrypt(fs.readFileSync(file, 'utf8')))
    else return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/**
 * @param {String} file 
 * @param {*} content 
 */
function writeFile(file, content) {
    let json = JSON.stringify(content, null, 4)
    fs.writeFileSync(file, file.endsWith('.jsdata')? encrypt(json): json, 'utf8')
}

/**
 * Replace Paths in string
 * @param {string} path 
 */
function replaceArgs(path) {
    if(path.includes('%appdata%')) path = path.replace('%appdata%', process.env.APPDATA)
    if(path.includes('%dir%')) path = path.replace('%dir%', __dirname)
    return path
}

module.exports = {
    Database
}