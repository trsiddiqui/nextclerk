import App from '../src/app'
import express from 'express'
import IndexRoute from '../src/routes'
import UsersRoute from '../src/routes/users'
import validateEnv from '../src/utils/validateEnv'
import routes from '../src/routes/supportingPackage'

validateEnv()

const app = new App(routes)

// const app = new App([new IndexRoute(), new UsersRoute(), new SupportingPackagesRoute()])


app.listen()
