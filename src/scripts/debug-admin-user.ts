import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const debugAdminUser = async () => {
  const payload = await getPayload({ config: configPromise })

  try {
    const users = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'anasaltaf674@gmail.com' },
      },
      showHiddenFields: true,
    })

    if (users.totalDocs === 0) {
      console.log('❌ God Admin User NOT FOUND')
    } else {
      const user = users.docs[0]
      console.log('✅ God Admin User Found')
      console.log(`ID: ${user.id}`)
      console.log(`Email: ${user.email}`)
      console.log(`Roles: ${JSON.stringify(user.roles)}`)

      if (user.roles?.includes('admin')) {
        console.log('✅ User has "admin" role.')
      } else {
        console.log('❌ User MISSING "admin" role.')
      }
    }
  } catch (error) {
    console.error('Error finding user:', error)
  }
  process.exit(0)
}

debugAdminUser()
