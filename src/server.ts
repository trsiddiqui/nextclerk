import App from '@/app'
import express from 'express'
import IndexRoute from '@/routes'
import UsersRoute from '@/routes/users'
import validateEnv from '@utils/validateEnv'
import routes from '../src/routes/supportingPackage'

validateEnv()

const app = new App(routes)

// const app = new App([new IndexRoute(), new UsersRoute(), new SupportingPackagesRoute()])


app.listen()
