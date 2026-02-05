import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  const godAdminEmail = process.env.GOD_ADMIN_EMAIL
  const godAdminPassword = process.env.GOD_ADMIN_PASSWORD

  if (!godAdminEmail || !godAdminPassword) {
    payload.logger.error('GOD_ADMIN_EMAIL or GOD_ADMIN_PASSWORD not set in environment.')
    process.exit(1)
  }

  payload.logger.info(`Seeding God Admin with email: ${godAdminEmail}`)

  try {
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: godAdminEmail,
        },
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      payload.logger.info('God Admin user already exists.')
    } else {
      await payload.create({
        collection: 'users',
        data: {
          email: godAdminEmail,
          password: godAdminPassword,
          roles: ['admin'],
          name: 'God Admin',
        },
      })
      payload.logger.info('God Admin user created successfully.')
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Error seeding God Admin:')
    process.exit(1)
  }

  // Explicitly close database connection if needed or just exit
  // Payload's local API doesn't always need an explicit close if usage is script-based, but
  // ensuring the script exits is good.
  // Note: Depending on db adapter, we might not need to do anything else.
  process.exit(0)
}

seed()
