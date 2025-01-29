import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Modal, Box, Button } from "@mui/material";

interface ModalContextProps {
  showModal: (content: ReactNode, onAccept?: () => void, onCancel?: () => void) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [onAccept, setOnAccept] = useState<(() => void) | undefined>();
  const [onCancel, setOnCancel] = useState<(() => void) | undefined>();

  const hideModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showModal = useCallback(
    (content: ReactNode, acceptCallback?: () => void, cancelCallback: () => void = hideModal) => {
      setModalContent(content);
      setOnAccept(() => acceptCallback);
      setOnCancel(() => cancelCallback);
      setIsOpen(true);
    },
    [
      hideModal
    ]
  );

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal open={isOpen} onClose={hideModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <div>{modalContent}</div>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="outlined" color="error" onClick={() => {
              onCancel?.();
              hideModal();
            }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={() => {
              onAccept?.();
              hideModal();
            }}>
              Accept
            </Button>
          </Box>
        </Box>
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
