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
    'matches.show': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: [ParamValue?]; params?: {'section'?: ParamValue} }
    'settings.preferences': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.email': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.premium.cancel': { paramsTuple?: []; params?: {} }
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
    'matches.show': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: [ParamValue?]; params?: {'section'?: ParamValue} }
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
    'matches.show': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'messages': { paramsTuple?: []; params?: {} }
    'alerts': { paramsTuple?: []; params?: {} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'settings.show': { paramsTuple?: [ParamValue?]; params?: {'section'?: ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'settings.preferences': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.email': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.premium.cancel': { paramsTuple?: []; params?: {} }
    'premium.subscribe': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}