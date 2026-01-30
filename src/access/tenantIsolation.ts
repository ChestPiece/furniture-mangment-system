import { Access } from 'payload'

export const tenantAdmins: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  // Allow owners to manage their own tenant settings
  if (user?.roles?.includes('owner')) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

export const tenantUsers: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

import { PayloadRequest } from 'payload'

export const tenantFilter = ({ req: { user } }: { req: PayloadRequest }) => {
  if (user?.roles?.includes('admin')) return true

  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return {
    tenant: {
      exists: false, // Or some impossible condition to prevent access
    },
  }
}
