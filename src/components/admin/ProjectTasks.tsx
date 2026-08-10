"use client";

import { useFormStatus } from "react-dom";
import {
  createProjectTaskAction,
  deleteProjectTaskAction,
  toggleProjectTaskAction,
} from "@/lib/admin/actions/projects";
import {
  AdminButton,
  AdminField,
  AdminInput,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type ProjectTaskItem = {
  id: number;
  title: string;
  done: number;
};

function AddTaskButton() {
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? "Adicionando..." : "Adicionar"}
    </AdminButton>
  );
}

export function ProjectTasks({
  projectId,
  tasks,
}: {
  projectId: number;
  tasks: ProjectTaskItem[];
}) {
  const pending = tasks.filter((task) => !task.done).length;
  const done = tasks.length - pending;
  const create = createProjectTaskAction.bind(null, projectId);

  return (
    <section className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-medium">O que falta fazer</h2>
          <p className="text-sm text-muted">
            Checklist do dia a dia deste projeto.
          </p>
        </div>
        <p className="text-sm text-muted">
          {pending > 0
            ? `${pending} pendente${pending > 1 ? "s" : ""}`
            : tasks.length > 0
              ? "Tudo concluído"
              : "Nenhuma tarefa ainda"}
          {done > 0 ? ` · ${done} feita${done > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      <form action={create} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <AdminField label="Nova tarefa" className="flex-1">
          <AdminInput
            name="title"
            required
            placeholder="Ex.: Ajustar login, entregar layout, publicar site..."
          />
        </AdminField>
        <div className="flex items-end">
          <AddTaskButton />
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted">
          Adicione o que ainda precisa ser feito neste projeto.
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const toggle = toggleProjectTaskAction.bind(null, task.id);
            const remove = deleteProjectTaskAction.bind(null, task.id);
            return (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5"
              >
                <form action={toggle} className="pt-0.5">
                  <button
                    type="submit"
                    aria-label={
                      task.done ? "Marcar como pendente" : "Marcar como concluída"
                    }
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition",
                      task.done
                        ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300"
                        : "border-white/20 hover:border-[#ff6b35]/50"
                    )}
                  >
                    {task.done ? "✓" : ""}
                  </button>
                </form>
                <p
                  className={cn(
                    "flex-1 text-sm",
                    task.done ? "text-muted line-through" : null
                  )}
                >
                  {task.title}
                </p>
                <form action={remove}>
                  <button
                    type="submit"
                    className="text-xs text-muted transition hover:text-red-300"
                  >
                    Remover
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
