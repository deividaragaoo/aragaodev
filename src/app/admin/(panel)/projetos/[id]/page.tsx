import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PageHeader, AdminButton } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectTasks } from "@/components/admin/ProjectTasks";
import {
  deleteProjectAction,
  updateProjectAction,
} from "@/lib/admin/actions/projects";
import { listClients, listProjectTasks } from "@/lib/admin/queries";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ensureAdminReady } from "@/lib/db/ensure";

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureAdminReady();
  const { id } = await params;
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, Number(id)),
  });
  if (!project) notFound();

  const [clients, tasks] = await Promise.all([
    listClients(),
    listProjectTasks(project.id),
  ]);
  const update = updateProjectAction.bind(null, project.id);
  const remove = deleteProjectAction.bind(null, project.id);

  return (
    <div>
      <PageHeader
        title="Editar projeto"
        description={project.name}
        actions={
          <form action={remove}>
            <AdminButton variant="danger" type="submit">
              Excluir
            </AdminButton>
          </form>
        }
      />
      <ProjectForm action={update} clients={clients} initial={project} />
      <ProjectTasks projectId={project.id} tasks={tasks} />
    </div>
  );
}
