import { FormSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
      <FormSkeleton fields={4} />
    </div>
  )
}
