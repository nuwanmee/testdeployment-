export const roles = {
    admin: 'ADMIN',
    moderator: 'MODERATOR',
    client: 'CLIENT',
  } as const
  
  export type Role = keyof typeof roles