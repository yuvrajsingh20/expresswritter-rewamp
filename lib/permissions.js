export const ROLES = {
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
  FREELANCER: 'FREELANCER',
  STUDENT: 'STUDENT',
};

export const hasPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
