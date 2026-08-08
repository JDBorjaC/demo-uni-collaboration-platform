import { getCategories } from "@/lib/queries"
import { ProjectForm } from "@/components/project-form"

export default async function NewProjectPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create a project</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your project will start as a draft. Submit it for review once it's ready to publish.
      </p>
      <div className="mt-6">
        <ProjectForm categories={categories} />
      </div>
    </div>
  )
}
