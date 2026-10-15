import Fixture from '#models/fixture'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

/**
 * Pages behind the top menu. Chaînes, Groupes, Profils, Messages and Alertes
 * show demo content until their tables exist; Événements uses real StatsHub fixtures.
 */

const channels = [
  {
    initials: 'MK',
    color: '#1fd67a',
    bg: '#1d3a2c',
    name: 'MK Pro Tips',
    owner: 'Maxime K.',
    sport: 'Football · Ligue 1',
    subscribers: '2,1k',
    winRate: 74,
    price: 250,
    premium: true,
    description:
      'Analyses détaillées de la Ligue 1 et des coupes européennes, 3 à 5 pronos par semaine.',
  },
  {
    initials: 'TB',
    color: '#ffb224',
    bg: '#3a2d1d',
    name: 'Tennis Break',
    owner: 'Sarah Lopes',
    sport: 'Tennis · ATP / WTA',
    subscribers: '980',
    winRate: 71,
    price: 150,
    premium: false,
    description:
      'Les Grands Chelems et Masters 1000 décortiqués, focus sur les surfaces et la forme.',
  },
  {
    initials: 'NB',
    color: '#b98cff',
    bg: '#2d1d3a',
    name: 'NBA Nights',
    owner: 'Karim B.',
    sport: 'Basket · NBA',
    subscribers: '3,4k',
    winRate: 69,
    price: 300,
    premium: true,
    description: 'Spreads, totaux et props joueurs pour toutes les nuits NBA.',
  },
  {
    initials: 'CC',
    color: '#4d9fff',
    bg: '#1d2d3a',
    name: 'Combiné Club',
    owner: 'Nina D.',
    sport: 'Multi-sports',
    subscribers: '1,6k',
    winRate: 64,
    price: 200,
    premium: false,
    description: 'Des combinés raisonnables chaque week-end, gestion de bankroll incluse.',
  },
  {
    initials: 'RT',
    color: '#ff4d5e',
    bg: '#3a1d28',
    name: 'Rugby Time',
    owner: 'Thomas M.',
    sport: 'Rugby · Top 14',
    subscribers: '640',
    winRate: 66,
    price: 120,
    premium: false,
    description: 'Top 14 et Champions Cup, avec les compos analysées avant chaque match.',
  },
  {
    initials: 'SA',
    color: '#1fd67a',
    bg: '#1d3a2c',
    name: 'Serie A Insider',
    owner: 'Léa Costa',
    sport: 'Football · Serie A',
    subscribers: '1,2k',
    winRate: 64,
    price: 180,
    premium: true,
    description: 'Le calcio vu de l’intérieur : blessures, rotations et cotes à valeur.',
  },
]

const groups = [
  {
    initials: 'LP',
    color: '#1fd67a',
    bg: '#1d3a2c',
    name: 'Ligue des Pronos',
    members: '12,4k',
    posts: 38,
    description: 'Le grand groupe de la communauté, tous sports confondus.',
  },
  {
    initials: 'PL',
    color: '#ffb224',
    bg: '#3a2d1d',
    name: 'Premier League FR',
    members: '8,1k',
    posts: 21,
    description: 'La Premier League commentée en français, match par match.',
  },
  {
    initials: 'NBA',
    color: '#b98cff',
    bg: '#2d1d3a',
    name: 'NBA Insider',
    members: '5,7k',
    posts: 17,
    description: 'Stats avancées, blessures et pronos NBA.',
  },
  {
    initials: 'S',
    color: '#4d9fff',
    bg: '#1d2d3a',
    name: 'Safe Bettors',
    members: '3,9k',
    posts: 9,
    description: 'Paris à faible risque et gestion de bankroll.',
  },
  {
    initials: 'C1',
    color: '#ff4d5e',
    bg: '#3a1d28',
    name: 'Champions League',
    members: '15,2k',
    posts: 44,
    description: 'Toute la Ligue des champions, des barrages à la finale.',
  },
  {
    initials: 'L1',
    color: '#1fd67a',
    bg: '#1d3a2c',
    name: 'Ligue 1 Talk',
    members: '6,3k',
    posts: 26,
    description: 'Le championnat de France, du Parc à la Beaujoire.',
  },
]

const tipsters = [
  {
    initials: 'MK',
    avatar: 'avatar-b',
    name: 'Maxime K.',
    handle: '@maximek',
    sport: 'Football · Ligue 1',
    winRate: 74,
    followers: '2,1k',
    tips: 312,
    verified: true,
  },
  {
    initials: 'SL',
    avatar: 'avatar-c',
    name: 'Sarah Lopes',
    handle: '@sarahl',
    sport: 'Tennis · ATP',
    winRate: 71,
    followers: '980',
    tips: 204,
    verified: true,
  },
  {
    initials: 'KB',
    avatar: 'avatar-d',
    name: 'Karim B.',
    handle: '@karimb',
    sport: 'Basket · NBA',
    winRate: 69,
    followers: '3,4k',
    tips: 451,
    verified: true,
  },
  {
    initials: 'ND',
    avatar: 'avatar-e',
    name: 'Nina D.',
    handle: '@ninad',
    sport: 'Football · Liga',
    winRate: 67,
    followers: '1,6k',
    tips: 188,
    verified: false,
  },
  {
    initials: 'TM',
    avatar: 'avatar-a',
    name: 'Thomas M.',
    handle: '@thomasm',
    sport: 'Rugby · Top 14',
    winRate: 66,
    followers: '640',
    tips: 97,
    verified: false,
  },
  {
    initials: 'LC',
    avatar: 'avatar-b',
    name: 'Léa Costa',
    handle: '@leacosta',
    sport: 'Football · Serie A',
    winRate: 64,
    followers: '1,2k',
    tips: 230,
    verified: true,
  },
]

const conversations = [
  {
    initials: 'MK',
    avatar: 'avatar-b',
    name: 'Maxime K.',
    last: 'Je publie mon prono PSG ce soir, reste connecté 👀',
    time: '2 min',
    unread: true,
  },
  {
    initials: 'SL',
    avatar: 'avatar-c',
    name: 'Sarah Lopes',
    last: 'Merci pour ton abonnement à Tennis Break !',
    time: '1 h',
    unread: true,
  },
  {
    initials: 'LP',
    avatar: 'avatar-a',
    name: 'Ligue des Pronos',
    last: 'Karim : quelqu’un a une analyse pour Lyon ce soir ?',
    time: '3 h',
    unread: true,
  },
  {
    initials: 'ND',
    avatar: 'avatar-e',
    name: 'Nina D.',
    last: 'Bien joué pour le Real, 3-0 comme prévu.',
    time: 'Hier',
    unread: false,
  },
  {
    initials: 'TM',
    avatar: 'avatar-a',
    name: 'Thomas M.',
    last: 'Tu suis le Top 14 ce week-end ?',
    time: 'Lun.',
    unread: false,
  },
]

const alerts = [
  {
    kind: 'win',
    title: 'Prono gagnant',
    text: 'Le pronostic « Real Madrid -1,5 » de Nina D. est validé : +210 Cr.',
    time: '5 min',
    unread: true,
  },
  {
    kind: 'follow',
    title: 'Nouvel abonné',
    text: 'Karim B. suit maintenant ton profil.',
    time: '20 min',
    unread: true,
  },
  {
    kind: 'tip',
    title: 'Nouveau pronostic',
    text: 'Maxime K. a publié un prono sur Paris SG – Marseille.',
    time: '1 h',
    unread: true,
  },
  {
    kind: 'live',
    title: 'Match en direct',
    text: 'Olympique Lyonnais – Crystal Palace vient de commencer.',
    time: '2 h',
    unread: true,
  },
  {
    kind: 'comment',
    title: 'Nouveau commentaire',
    text: 'Léa Costa a commenté ton pronostic.',
    time: '3 h',
    unread: true,
  },
  {
    kind: 'premium',
    title: 'Chaîne Premium',
    text: 'MK Pro Tips a publié un pronostic réservé aux abonnés.',
    time: '5 h',
    unread: true,
  },
  {
    kind: 'credits',
    title: 'Crédits',
    text: 'Tu as reçu 10 crédits pour une invitation acceptée.',
    time: 'Hier',
    unread: true,
  },
  {
    kind: 'lost',
    title: 'Prono perdant',
    text: 'Le pronostic « Boston +6 » de Sarah Lopes est perdu.',
    time: 'Hier',
    unread: false,
  },
]

export default class SectionsController {
  async channels({ view }: HttpContext) {
    return view.render('pages/chaines', { channels })
  }

  async groups({ view }: HttpContext) {
    return view.render('pages/groupes', { groups })
  }

  async profiles({ view }: HttpContext) {
    return view.render('pages/profils', { tipsters })
  }

  async messages({ view }: HttpContext) {
    return view.render('pages/messages', { conversations })
  }

  async alerts({ view }: HttpContext) {
    return view.render('pages/alertes', { alerts })
  }

  /**
   * Today's real fixtures from StatsHub, grouped by competition.
   */
  async events({ view, request }: HttpContext) {
    const filter = request.qs().statut ?? 'tous'
    const query = Fixture.query()
      .where('match_date', DateTime.utc().toISODate()!)
      .whereNot('status', 'canceled')
      .orderBy('tournament_name', 'asc')
      .orderBy('starts_at', 'asc')

    if (filter === 'live') query.where('status', 'inprogress')
    if (filter === 'a-venir') query.where('status', 'notstarted')
    if (filter === 'termines') query.where('status', 'finished')

    const fixtures = await query
    const competitions = new Map<string, Fixture[]>()
    for (const fixture of fixtures) {
      const key = `${fixture.tournamentName ?? 'Autre'}${fixture.country ? ' · ' + fixture.country : ''}`
      competitions.set(key, [...(competitions.get(key) ?? []), fixture])
    }

    return view.render('pages/evenements', {
      competitions: [...competitions.entries()].map(([name, matches]) => ({
        name,
        matches,
        logo: matches[0].tournamentLogo,
      })),
      total: fixtures.length,
      filter,
    })
  }
}
