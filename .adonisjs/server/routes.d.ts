import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'gate': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'channels': { paramsTuple?: []; params?: {} }
    'groups': { paramsTuple?: []; params?: {} }
    'profiles': { paramsTuple?: []; params?: {} }
    'events': { paramsTuple?: []; params?: {} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'premium.subscribe': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'gate': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'channels': { paramsTuple?: []; params?: {} }
    'groups': { paramsTuple?: []; params?: {} }
    'profiles': { paramsTuple?: []; params?: {} }
    'events': { paramsTuple?: []; params?: {} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'gate': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'channels': { paramsTuple?: []; params?: {} }
    'groups': { paramsTuple?: []; params?: {} }
    'profiles': { paramsTuple?: []; params?: {} }
    'events': { paramsTuple?: []; params?: {} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'premium.subscribe': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}