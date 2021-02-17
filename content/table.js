class Table {

    /**
     * Create a table
     * @constructor
     * @param {string} name 
     * @param {*} json 
     */
    constructor(name, json) {
        this.json = json
        this.name = name
    }

    /**
     * get a Table name
     */
    getName() {
        this.name
    }

    /**
     * get a Field by name
     * @param {string} name 
     */
    getField(name) {
        let field = this.json.data.find((value) => value.name == name)
        return field
    }
}

module.exports = {
    Table:Table
}