import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "../hooks/useApplication";
import KanbanColumn from "../components/Board/KanbanColumn";
import { COLUMN_CONFIG, COLUMN_ORDER } from "../constants/board";
import AddApplicationModal from "../components/Board/AddApplicationModal";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
} from "../types";

export default function BoardPage() {
  const navigate = useNavigate();
  const { data: applications, isLoading, isError } = useApplications();
  const createApplication = useCreateApplication();
  const deleteApplication = useDeleteApplication();
  const updateStatus = useUpdateApplicationStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] =
    useState<ApplicationStatus>("saved");

  // Group applications by status for kanban columns.
  const grouped = COLUMN_ORDER.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, status) => {
      acc[status] = applications?.filter((app) => app.status === status) ?? [];
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>,
  );

  // Called when a card is dropped in a new column.
  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;

    // Dropped outside a column or in the same column – do nothing.
    if (!destination) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    const appId = parseInt(draggableId);

    const app = applications?.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    updateStatus.mutate({ id: appId, status: newStatus });
  };

  const handleAddClick = (status: ApplicationStatus) => {
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleSubmit = async (input: CreateApplicationInput) => {
    await createApplication.mutateAsync({
      ...input,
      status: defaultStatus,
    } as CreateApplicationInput);
    setModalOpen(false);
  };

  const handleCardClick = (application: Application) => {
    navigate(`/applications/${application.id}`);
  };

  const handleDeleteClick = (id: number) => {
    deleteApplication.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <IconLoader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Failed to load applications. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-surface border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-medium text-gray-900">Board</h1>
        <button
          onClick={() => handleAddClick("saved")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <IconPlus size={14} />
          Add application
        </button>
      </div>

      {/* Stats row */}
      <div className="px-6 py-3 border-b border-border bg-surface flex items-center gap-6 shrink-0">
        <div className="text-xs text-gray-500">
          Total:{" "}
          <span className="font-medium text-gray-900">
            {applications?.length ?? 0}
          </span>
        </div>
        {COLUMN_ORDER.slice(0, 5).map((status) => (
          <div key={status} className="text-xs text-gray-500">
            {COLUMN_CONFIG[status].label}:{" "}
            <span className="font-medium text-gray-900">
              {grouped[status].length}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-hidden p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full overflow-x-auto pb-2">
            {COLUMN_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={grouped[status]}
                onAddClick={() => handleAddClick(status)}
                onCardClick={handleCardClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Add application modal */}
      {modalOpen && (
        <AddApplicationModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createApplication.isPending}
        />
      )}
    </div>
  );
}
