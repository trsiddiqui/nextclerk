import { KeycloakClient } from '@/clients/keycloakClient'
import { redis } from '@/server'
import { $DepartmentService, $EntityService, $UserService } from '@/services'
import { User, UserRequest } from '@/types'
import axios from 'axios'
import { NextFunction, Request, Response, Router } from 'express'
import { resolve } from 'path'

const router = Router()

router.get(`/:customerXRefID/users`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const dashboardUsers = await $UserService.getEntitiesUsersForDashboard({
    customerXRefID: req.params.customerXRefID,
  })
  const users = await kcClient.getUsersGroups({
    customerXRefID: req.params.customerXRefID,
    dashboardUsers,
  })
  res.send(users)
})

router.put(`/:customerXRefID/users/:userXRefID`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const { userXRefID, customerXRefID } = req.params
  const user = req.body as UserRequest

  const departments = await $DepartmentService.getDepartments({ customerXRefID })
  const entities = await $EntityService.validateAndGetEntities({
    identifiers: { uuids: [customerXRefID] },
  })
  const users = await $UserService.getEntitiesUsers({ customerXRefID })
  const userObject: Partial<User> = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAccountingManager: user.isAccountingManager,
    uuid: user.uuid,
    entityID: entities.get(customerXRefID).id,
    ...(user.managerUuid ? { managerID: users.find((u) => u.uuid === user.managerUuid).id } : {}),
    ...(user.departmentUuid
      ? { departmentID: departments.find((u) => u.uuid === user.departmentUuid).id }
      : {}),
  }

  await $UserService.updateUser({ user: userObject })
  await kcClient.updateUser(
    userObject.uuid,
    userObject.firstName,
    userObject.lastName,
    userObject.email
  )
  const [existingUser] = await $UserService.getUsersByIds({ identifiers: { uuids: [userXRefID] } })
  const userWithGroups = await kcClient.getUserGroups({ user: existingUser })
  if (
    !(
      user.groups.length === userWithGroups.groups.length &&
      user.groups.every((v, i) => v === userWithGroups.groups[i])
    )
  ) {
    const newGroups = user.groups.filter((g) => !userWithGroups.groups.includes(g))
    const deletedGroups = userWithGroups.groups.filter((g) => !user.groups.includes(g))
    const allGroups = await kcClient.getGroupObjects()
    if (newGroups) {
      for (const newGroup of newGroups) {
        await kcClient.addUserGroup(user.uuid, allGroups.find((x) => x.name === newGroup).id)
      }
    }
    if (deletedGroups) {
      for (const deletedGroup of deletedGroups) {
        await kcClient.deleteUserGroup(user.uuid, allGroups.find((x) => x.name === deletedGroup).id)
      }
    }
  }
  res.send(user)
})

router.put(`/:customerXRefID/users/:userXRefID`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const { userXRefID } = req.params
  const user = req.body as User
  await $UserService.updateUser({ user })
  const [existingUser] = await $UserService.getUsersByIds({ identifiers: { uuids: [userXRefID] } })
  const userWithGroups = await kcClient.getUserGroups({ user: existingUser })
  if (
    !(
      user.groups.length === userWithGroups.groups.length &&
      user.groups.every((v, i) => v === userWithGroups.groups[i])
    )
  ) {
    const newGroups = user.groups.filter((g) => !userWithGroups.groups.includes(g))
    const deletedGroups = userWithGroups.groups.filter((g) => !user.groups.includes(g))
    const allGroups = await kcClient.getGroupObjects()
    if (newGroups) {
      for (const newGroup of newGroups) {
        await kcClient.addUserGroup(user.uuid, allGroups.find((x) => x.name === newGroup).id)
      }
    }
    if (deletedGroups) {
      for (const deletedGroup of deletedGroups) {
        await kcClient.deleteUserGroup(user.uuid, allGroups.find((x) => x.name === deletedGroup).id)
      }
    }
  }
  res.send(user)
})

router.delete(`/:customerXRefID/users/:userXRefID`, async (req, res) => {
  const { userXRefID } = req.params
  await $UserService.validateAndGetUsers({ identifiers: { uuids: [userXRefID] } })
  await $UserService.deleteUser({ uuid: userXRefID })
  const kcClient = new KeycloakClient()
  await kcClient.disableUser(userXRefID)
})

router.get(`/groups`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const users = await kcClient.getGroups()
  res.send(users)
})

export default router
