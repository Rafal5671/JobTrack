import type { Application, ApplicationStatus } from "../../types";
import KanbanCard from "./KanbanCard";
import { Droppable } from "@hello-pangea/dnd";
import { IconPlus } from "@tabler/icons-react";
import { COLUMN_CONFIG } from "../../constants/board";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  onAddClick: () => void;
  onCardClick: (application: Application) => void;
  onDeleteClick: (id: number) => void;
}

export default function KanbanColumn({
  status,
  applications,
  onAddClick,
  onCardClick,
  onDeleteClick,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className="flex flex-col bg-surface-secondary rounded-xl p-2.5 w-64 shrink-0 max-h-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
          >
            {applications.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={`Add to ${config.label}`}
        >
          <IconPlus size={14} />
        </button>
      </div>

      {/* Cards */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 flex-1 rounded-lg transition-colors p-1 ${
              snapshot.isDraggingOver ? "bg-brand-50" : ""
            }`}
          >
            {applications.map((app, index) => (
              <KanbanCard
                key={app.id}
                index={index}
                application={app}
                onClick={() => onCardClick(app)}
                onDelete={() => onDeleteClick(app.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
