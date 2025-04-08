import { useModalStore } from '../../stores/useModalStore';
import { cnsMerge } from '../../utils/cnsMerge';

export const Modal = () => {
  const { isOpen, title, content, onConfirm, onCancel, closeModal } = useModalStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      <div
        className={cnsMerge(
          "relative bg-white rounded-lg p-6",
          "max-w-md w-full mx-4",
          "shadow-xl"
        )}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-6">{content}</div>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}; 