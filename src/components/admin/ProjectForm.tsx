import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/lib/admin/actions/projects";
import { PROJECT_STATUS_LABEL } from "@/lib/admin/constants";
import { centsToInput, toDateInputValue } from "@/lib/admin/format";
import type { Client, Project } from "@/lib/db/schema";
import { AdminButton, AdminCard, Field, SelectField, TextArea } from "./ui";

export function ProjectForm({
  project,
  clients,
}: {
  project?: Project;
  clients: Client[];
}) {
  const action = project ? updateProjectAction : createProjectAction;

  return (
    <AdminCard>
      <form action={action} className="grid gap-5">
        {project ? <input name="id" type="hidden" value={project.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Cliente"
            name="clientId"
            defaultValue={project?.clientId}
          >
            <option value="">Selecione</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </SelectField>
          <Field
            label="Nome do projeto"
            name="name"
            defaultValue={project?.name}
            required
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={project?.status ?? "planning"}
          >
            {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <Field
            label="Valor total"
            name="total"
            defaultValue={centsToInput(project?.totalCents)}
            required
          />
          <Field
            label="Inicio"
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(project?.startDate)}
          />
          <Field
            label="Prazo"
            name="dueDate"
            type="date"
            defaultValue={toDateInputValue(project?.dueDate)}
          />
        </div>
        <TextArea
          label="Descricao"
          name="description"
          defaultValue={project?.description}
        />
        <div className="flex flex-wrap gap-3">
          <AdminButton>{project ? "Salvar projeto" : "Criar projeto"}</AdminButton>
          <AdminButton href="/admin/projetos" variant="secondary">
            Voltar
          </AdminButton>
        </div>
      </form>
      {project ? (
        <form action={deleteProjectAction} className="mt-4">
          <input name="id" type="hidden" value={project.id} />
          <AdminButton variant="danger">Remover projeto</AdminButton>
        </form>
      ) : null}
    </AdminCard>
  );
}
