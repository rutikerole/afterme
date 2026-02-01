import { toast } from "sonner";

/**
 * Custom hook for common toast patterns in AfterMe
 * Provides semantic toast methods for various actions
 */
export function useToast() {
  return {
    // Success toasts
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },

    // Error toasts
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },

    // Info toasts
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },

    // Warning toasts
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },

    // ════════════════════════════════════════════════════════════════════
    // SEMANTIC TOASTS FOR AFTERME ACTIONS
    // ════════════════════════════════════════════════════════════════════

    // Memory actions
    memorySaved: () => {
      toast.success("Memory saved", {
        description: "Your precious moment has been preserved.",
      });
    },

    memoryDeleted: () => {
      toast.success("Memory removed", {
        description: "The memory has been deleted.",
      });
    },

    // Voice message actions
    voiceRecorded: () => {
      toast.success("Voice message saved", {
        description: "Your voice will be treasured forever.",
      });
    },

    voiceDeleted: () => {
      toast.success("Voice message removed");
    },

    // Story actions
    storySaved: () => {
      toast.success("Story saved", {
        description: "Your story has been preserved.",
      });
    },

    storyPublished: () => {
      toast.success("Story published", {
        description: "Your story is now part of your legacy.",
      });
    },

    // Vault actions
    vaultItemAdded: (category: string) => {
      toast.success(`${category} added`, {
        description: "Securely stored in your vault.",
      });
    },

    vaultItemUpdated: () => {
      toast.success("Item updated", {
        description: "Your changes have been saved.",
      });
    },

    vaultItemDeleted: () => {
      toast.success("Item removed from vault");
    },

    // Family member actions
    familyMemberAdded: (name: string) => {
      toast.success(`${name} added to your trusted circle`, {
        description: "They are now part of your legacy.",
      });
    },

    familyMemberRemoved: () => {
      toast.success("Family member removed");
    },

    // Legacy instructions
    instructionSaved: () => {
      toast.success("Instructions saved", {
        description: "Your wishes have been recorded.",
      });
    },

    // General actions
    changesSaved: () => {
      toast.success("Changes saved");
    },

    copied: (what: string = "Text") => {
      toast.success(`${what} copied to clipboard`);
    },

    uploaded: (filename?: string) => {
      toast.success("Upload complete", {
        description: filename ? `${filename} has been uploaded.` : undefined,
      });
    },

    // Loading toast with promise
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },

    // Error handlers
    networkError: () => {
      toast.error("Connection failed", {
        description: "Please check your internet connection and try again.",
      });
    },

    validationError: (field: string) => {
      toast.error("Invalid input", {
        description: `Please check the ${field} field.`,
      });
    },

    authError: () => {
      toast.error("Authentication required", {
        description: "Please log in to continue.",
      });
    },

    permissionError: () => {
      toast.error("Permission denied", {
        description: "You don't have access to this action.",
      });
    },

    // Dismiss all toasts
    dismiss: () => {
      toast.dismiss();
    },
  };
}

// Direct exports for simpler usage without hook
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
};
