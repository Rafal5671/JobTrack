import { IconMapPin, IconTrash, IconExternalLink } from "@tabler/icons-react";
import type { Application } from "../../types";
import { Draggable } from "@hello-pangea/dnd";

interface KanbanCardProps {
  application: Application;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}

export default function KanbanCard({
  application,
  index,
  onClick,
  onDelete,
}: KanbanCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete application to ${application.company}?`)) {
      onDelete();
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(application.job_url, "_blank");
  };

  return (
    <Draggable draggableId={String(application.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-surface border border-border rounded-lg p-3 cursor-pointer hover:border-border-strong transition-colors group ${
            snapshot.isDragging ? "shadow-md rotate-1 opacity-90" : ""
          }`}
        >
          {/* Company and role */}
          <p className="text-sm font-medium text-gray-900 mb-0.5">
            {application.company}
          </p>
          <p className="text-xs text-gray-500 mb-3">{application.role}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {application.location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <IconMapPin size={11} />
                {application.location}
              </span>
            )}

            {/* Actions – visible on hover */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              {application.job_url && (
                <button
                  onClick={handleExternalLink}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Open job listing"
                >
                  <IconExternalLink size={13} />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Delete application"
              >
                <IconTrash size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
