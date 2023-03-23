import { RoleEnum } from './RoleEnum';

export const FilterRoleEnum = Object.freeze({
  Volunteer: { description: RoleEnum.Volunteer.description, value: 1 },
  Staff: { description: RoleEnum.Staff.description, value: 2 },
  Manager: { description: RoleEnum.Manager.description, value: 3 },
  Employee: { description: RoleEnum.Employee.description, value: 6 },
});
