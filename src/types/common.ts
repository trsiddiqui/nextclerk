export interface EntityDate {
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}

export interface EntityDateWithArchive extends EntityDate {
  archivedAt?: Date
  archivedBy?: string
}

export interface EntityDateWithDelete extends EntityDate {
  deletedAt: Date
  deletedBy: string
}
