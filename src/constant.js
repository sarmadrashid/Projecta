export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "projectadmin",
  MEMBER: "member",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TO_DO: "to_do",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);
