declare type Config = {
    path:PathConf,
    name:string
}

declare type PathConf = {
    base:string
}

declare type data = {
    name:string,
    type:string,
    size:number
}[]

declare type insertData = {
    value:any
}[]

declare interface baseEvent {
    database_name:string
    add:(database_name:string, data:any) => void,
    getTable: (table_name:string) => void
}

declare interface insertEvent extends baseEvent {
    add:(database_name:string, content:insertData) => void
}

declare interface createEvent extends baseEvent {
    add:(database_name:string, data:data) => void
}

declare type createCallBack = (event:createEvent) => void
declare type insertCallBack = (event:insertEvent) => void
declare type baseCallBack = (event:baseEvent) => void

export class Database {
    name:string;
    config:Config;

    on(eventName:'create', callback:createCallBack): void
    on(eventName:'insert', callback:insertCallBack): void
    on(eventName:'delete', callback:baseCallBack): void
    on(eventName:'query', callback:baseCallBack): void
    on(eventName:'config', callback:baseCallBack): void

    save(): void
    
    static open(path:string): Database
}

