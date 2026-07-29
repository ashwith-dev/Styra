import type { ClothingItemBrief } from "@/lib/types";

export type LookSource = "manual" | "ai";

export type SaveState = "idle" | "saving" | "deleting" | "success" | "error";

export interface SavedLookItem {
  id: string;
  clothing_item_id: string;
  thumbnail_url?: string | null;
  segmented_image_url?: string | null;
  attributes?: Record<string, unknown>;
}

export interface SavedLook {
  id: string;
  name: string;
  description?: string;
  category?: string;
  season?: string;
  tags?: string[];
  source: LookSource;
  items: SavedLookItem[];
  created_at: string;
  updated_at: string;
}

export interface LookFormValues {
  name: string;
  description: string;
  category: string;
  season: string;
  selectedItemIds: string[];
}

export interface SavedLookActions {
  create: (
    data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
  ) => Promise<SavedLook | null>;
  update: (
    id: string,
    updates: Partial<Omit<SavedLook, "id" | "created_at">>,
  ) => Promise<SavedLook | null>;
  delete: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  getLookById: (id: string) => SavedLook | null;
}

export interface SavedLookViewModel {
  looks: SavedLook[];
  saveState: SaveState;
  error: string | null;
  actions: SavedLookActions;
}

export interface ClothingSelectorModalProps {
  visible: boolean;
  items: ClothingItemBrief[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}
