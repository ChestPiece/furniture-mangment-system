/**
 * Safely extracts the tenant ID from a user's tenant field.
 * Handles cases where the tenant field might be a string ID or a populated object.
 *
 * @param tenant - The tenant field from a User object (string | { id: string } | undefined | null)
 * @returns The tenant ID string or undefined if not present
 */
export const extractTenantId = (
  tenant: string | { id: string } | undefined | null,
): string | undefined => {
  if (!tenant) return undefined
  return typeof tenant === 'object' ? tenant.id : tenant
}
