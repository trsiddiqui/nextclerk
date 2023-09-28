import { KeycloakClient } from '@/clients/keycloakClient'
import { $DepartmentService, $EntityService, $UserService } from '@/services'
import { User, UserRequest } from '@/types'
import { Router } from 'express'
import 'express-async-errors'

const router = Router()

/**
 * USER DASHBOARD START
 */

router.get(`/:customerXRefID/users`, async (req, res) => {
  const kcClient = new KeycloakClient()
  console.log('Requesting Users from Nextclerk')
  const dashboardUsers = await $UserService.getEntitiesUsersForDashboard({
    customerXRefID: req.params.customerXRefID,
  })
  const usersForKCStatus = await kcClient.getUsers()
  console.log('Requesting User Groups from Keycloak')
  const users = await kcClient.getUsersGroups({
    customerXRefID: req.params.customerXRefID,
    dashboardUsers,
    keycloakUsers: usersForKCStatus,
  })
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.status(200).send(users)
})

router.post(`/:customerXRefID/users`, async (req, res) => {
  const { customerXRefID } = req.params
  const kcClient = new KeycloakClient()
  const user = req.body as UserRequest
  const modelUser: Partial<User> = user
  await kcClient.createUser(user.uuid, user.firstName, user.lastName, user.email, user.groups)
  if (user.departmentUuid) {
    const departments = await $DepartmentService.validateAndGetDepartments({
      identifiers: { uuids: [user.departmentUuid] },
    })
    modelUser.departmentID = departments.get(user.departmentUuid).id
  }
  if (user.entityUuid) {
    const entities = await $EntityService.validateAndGetEntities({
      identifiers: { uuids: [customerXRefID] },
    })
    modelUser.entityID = entities.get(user.entityUuid).id
  }
  if (user.managerUuid) {
    const users = await $UserService.validateAndGetUsers({
      identifiers: { uuids: [user.managerUuid] },
    })
    modelUser.managerID = users.get(user.managerUuid).id
  }
  const users = await kcClient.getUsers()
  const insertedUser = users.find((x) => x.email === user.email && x.lastName === user.lastName)
  modelUser.uuid = insertedUser.id
  await $UserService.createUser({ user: modelUser })
  await kcClient.createUserPassword(insertedUser.id, 'P@55word1')
  res.status(201).send({ user: modelUser })
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
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.status(200).send(user)
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
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(user)
})

router.delete(`/:customerXRefID/users/:userXRefID`, async (req, res) => {
  const { userXRefID } = req.params
  await $UserService.validateAndGetUsers({ identifiers: { uuids: [userXRefID] } })
  await $UserService.deleteUser({ uuid: userXRefID })
  const kcClient = new KeycloakClient()
  await kcClient.disableUser(userXRefID)
  res.sendStatus(200)
})

router.put(`/:customerXRefID/users/:userXRefID/actions/disable`, async (req, res) => {
  const { userXRefID } = req.params
  await $UserService.validateAndGetUsers({ identifiers: { uuids: [userXRefID] } })
  const kcClient = new KeycloakClient()
  await kcClient.disableUser(userXRefID)
  res.sendStatus(200)
})

router.put(`/:customerXRefID/users/:userXRefID/actions/enable`, async (req, res) => {
  const { userXRefID } = req.params
  await $UserService.validateAndGetUsers({ identifiers: { uuids: [userXRefID] } })
  const kcClient = new KeycloakClient()
  await kcClient.enableUser(userXRefID)
  res.sendStatus(200)
})

router.get(`/groups`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const groups = await kcClient.getGroups()
  res.send(groups)
})

/**
 * USER DASHBOARD END
 */

/**
 * GROUP DASHBOARD END
 */

router.get(`/groupsWithRoles`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const groups = await kcClient.getGroupWithRoles()
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(groups)
})

router.put(`/groups/:groupId/roles`, async (req, res) => {
  const { groupId } = req.params
  const kcClient = new KeycloakClient()
  const groups = await kcClient.addRolesToGroup(groupId, req.body)
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(groups)
})

router.delete(`/groups/:groupId/roles`, async (req, res) => {
  const { groupId } = req.params
  const kcClient = new KeycloakClient()
  const groups = await kcClient.removeRolesFromGroup(groupId, req.body)
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(groups)
})

router.post(`/groups`, async (req, res) => {
  const { name } = req.body
  const kcClient = new KeycloakClient()
  const groups = await kcClient.addGroup(name)
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(groups)
})

router.get(`/roles`, async (req, res) => {
  const kcClient = new KeycloakClient()
  const roles = await kcClient.getRoleObjects()
  // deepcode ignore XSS: <please specify a reason of ignoring this>
  res.send(roles)
})

/**
 * GROUP DASHBOARD END
 */

export default router
