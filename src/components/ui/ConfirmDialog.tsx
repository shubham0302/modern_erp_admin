import Dialog from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    title={title}
    destructive
    primaryAction={{ label: confirmLabel, onClick: onConfirm }}
    secondaryAction={{ label: "Cancel", onClick: onCancel }}
  >
    <p className="text-sm text-nl-600">{message}</p>
  </Dialog>
);

export default ConfirmDialog;
