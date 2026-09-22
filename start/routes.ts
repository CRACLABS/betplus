/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/gate', { tab: 'login' }).as('gate').use(middleware.guest())

router.on('/feed').render('pages/home').as('home').use(middleware.auth())

router
  .post('/premium/subscribe', async ({ auth, response, session }) => {
    // TODO: brancher un vrai paiement — pour l'instant on simule l'abonnement
    const user = auth.user!
    user.isPremium = true
    await user.save()
    session.flash('success', 'Bienvenue dans BetPlus Premium')
    return response.redirect().toRoute('home')
  })
  .as('premium.subscribe')
  .use(middleware.auth())

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
