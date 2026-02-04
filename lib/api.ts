// =============================================================================
// API UTILITIES
// Centralized API call utilities for frontend-backend communication
// =============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for auth
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "Request failed", data.details);
  }

  return data;
}

// =============================================================================
// VOICE MESSAGES API
// =============================================================================

export interface VoiceMessage {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  duration: number;
  mimeType: string;
  tags: string[];
  isPrivate: boolean;
  releaseAfterDeath: boolean;
  recordedAt: string;
  createdAt: string;
}

export interface VoiceMessagesResponse {
  messages: VoiceMessage[];
  total: number;
  page: number;
  totalPages: number;
}

export const voiceMessagesApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<VoiceMessagesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return apiRequest(`/api/voice-messages${query ? `?${query}` : ""}`);
  },

  async create(data: {
    title: string;
    description?: string;
    fileUrl: string; // base64 data URL
    fileSize: number;
    duration: number;
    mimeType?: string;
    tags?: string[];
    isPrivate?: boolean;
    releaseAfterDeath?: boolean;
  }): Promise<VoiceMessage> {
    return apiRequest("/api/voice-messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/voice-messages/${id}`, {
      method: "DELETE",
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    tags: string[];
    isPrivate: boolean;
  }>): Promise<VoiceMessage> {
    return apiRequest(`/api/voice-messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// MEMORIES API
// =============================================================================

export interface Memory {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string;
  fileSize?: number;
  dateTaken?: string;
  location?: string;
  tags: string[];
  people: string[];
  isPrivate: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface MemoriesResponse {
  memories: Memory[];
  total: number;
  page: number;
  totalPages: number;
}

export const memoriesApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isFavorite?: boolean;
  }): Promise<MemoriesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.isFavorite) searchParams.set("isFavorite", "true");

    const query = searchParams.toString();
    return apiRequest(`/api/memories${query ? `?${query}` : ""}`);
  },

  async create(data: {
    title: string;
    description?: string;
    mediaUrl: string; // base64 data URL
    mediaType?: "image" | "video";
    fileSize?: number;
    dateTaken?: string;
    location?: string;
    tags?: string[];
    people?: string[];
    isPrivate?: boolean;
  }): Promise<Memory> {
    return apiRequest("/api/memories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/memories/${id}`, {
      method: "DELETE",
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    location: string;
    tags: string[];
    people: string[];
    isPrivate: boolean;
    isFavorite: boolean;
  }>): Promise<Memory> {
    return apiRequest(`/api/memories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// STORIES API
// =============================================================================

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  wordCount: number;
  readTime: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesResponse {
  stories: Story[];
  total: number;
  page: number;
  totalPages: number;
}

export const storiesApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<StoriesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return apiRequest(`/api/stories${query ? `?${query}` : ""}`);
  },

  async getById(id: string): Promise<Story> {
    return apiRequest(`/api/stories/${id}`);
  },

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    coverImageUrl?: string;
    status?: "draft" | "published";
    isPrivate?: boolean;
  }): Promise<Story> {
    return apiRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/stories/${id}`, {
      method: "DELETE",
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    coverImageUrl: string;
    status: "draft" | "published" | "archived";
    isPrivate: boolean;
  }>): Promise<Story> {
    return apiRequest(`/api/stories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// FAMILY MEMBERS API
// =============================================================================

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  avatar?: string;
  accessLevel: "viewer" | "editor" | "executor";
  canAccessVoice: boolean;
  canAccessMemories: boolean;
  canAccessStories: boolean;
  canAccessVault: boolean;
  canAccessLegacy: boolean;
  isInvited: boolean;
  invitedAt?: string;
  acceptedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface FamilyMembersResponse {
  members: FamilyMember[];
  total: number;
}

export const familyApi = {
  async getAll(): Promise<FamilyMembersResponse> {
    return apiRequest("/api/family");
  },

  async create(data: {
    name: string;
    relationship: string;
    email?: string;
    phone?: string;
    avatar?: string;
    accessLevel?: string;
    canAccessVoice?: boolean;
    canAccessMemories?: boolean;
    canAccessStories?: boolean;
    canAccessVault?: boolean;
    canAccessLegacy?: boolean;
    notes?: string;
  }): Promise<FamilyMember> {
    return apiRequest("/api/family", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/family/${id}`, {
      method: "DELETE",
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    relationship: string;
    email: string;
    phone: string;
    avatar: string;
    accessLevel: string;
    canAccessVoice: boolean;
    canAccessMemories: boolean;
    canAccessStories: boolean;
    canAccessVault: boolean;
    canAccessLegacy: boolean;
    notes: string;
  }>): Promise<FamilyMember> {
    return apiRequest(`/api/family/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// VAULT API
// =============================================================================

export interface VaultItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  encryptedData?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  tags: string[];
  importance: "low" | "normal" | "high" | "critical";
  expiryDate?: string;
  reminderDate?: string;
  isArchived: boolean;
  lastAccessedAt?: string;
  createdAt: string;
}

export interface VaultResponse {
  items: VaultItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const vaultApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<VaultResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.category) searchParams.set("category", params.category);

    const query = searchParams.toString();
    return apiRequest(`/api/vault${query ? `?${query}` : ""}`);
  },

  async create(data: {
    name: string;
    description?: string;
    category: string;
    encryptedData?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    tags?: string[];
    importance?: string;
    expiryDate?: string;
    reminderDate?: string;
  }): Promise<VaultItem> {
    return apiRequest("/api/vault", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/vault/${id}`, {
      method: "DELETE",
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    encryptedData: string;
    tags: string[];
    importance: string;
    expiryDate: string;
    reminderDate: string;
    isArchived: boolean;
  }>): Promise<VaultItem> {
    return apiRequest(`/api/vault/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// TRUSTEES API
// =============================================================================

export interface Trustee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  isVerified: boolean;
  verifiedAt?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export interface TrusteesResponse {
  trustees: Trustee[];
}

export const trusteesApi = {
  async getAll(): Promise<TrusteesResponse> {
    return apiRequest("/api/trustees");
  },

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    relationship: string;
    priority?: number;
  }): Promise<{ trustee: Trustee }> {
    return apiRequest("/api/trustees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    relationship: string;
    priority: number;
    isActive: boolean;
  }>): Promise<{ trustee: Trustee }> {
    return apiRequest(`/api/trustees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/api/trustees/${id}`, {
      method: "DELETE",
    });
  },
};

// =============================================================================
// LEGACY ACCESS API (Public - no auth required)
// =============================================================================

export interface LegacyAccessRequest {
  id: string;
  status: string;
  statusMessage?: string;
  verificationMethod: string;
  userName: string;
  gracePeriodEnd?: string;
  accessExpiresAt?: string;
  createdAt: string;
  trusteeConfirmations?: {
    total: number;
    confirmed: number;
  };
}

export interface LegacyContent {
  user: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  accessExpiresAt: string;
  content: {
    voiceMessages: Array<{
      id: string;
      title: string;
      description?: string;
      fileUrl: string;
      duration: number;
      transcript?: string;
      recordedAt: string;
      tags: string[];
    }>;
    memories: Array<{
      id: string;
      title: string;
      description?: string;
      mediaType: string;
      mediaUrl: string;
      dateTaken?: string;
      location?: string;
      tags: string[];
      people: string[];
    }>;
    stories: Array<{
      id: string;
      title: string;
      content: string;
      excerpt?: string;
      category: string;
      coverImageUrl?: string;
      publishedAt?: string;
      tags: string[];
    }>;
    legacyInstructions: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      attachmentUrls: string[];
    }>;
  };
}

export const legacyAccessApi = {
  async submitRequest(data: {
    userEmail: string;
    requesterName: string;
    requesterEmail: string;
    requesterPhone?: string;
    relationship: string;
    verificationMethod: "death_certificate" | "trustee_confirmation" | "both";
    deathCertificateUrl?: string;
  }): Promise<{ success: boolean; requestId: string; message: string }> {
    return apiRequest("/api/legacy-access", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async checkStatus(email: string, requestId?: string): Promise<{ requests: LegacyAccessRequest[] }> {
    const params = new URLSearchParams({ email });
    if (requestId) params.set("requestId", requestId);
    return apiRequest(`/api/legacy-access?${params.toString()}`);
  },

  async getConfirmationDetails(token: string): Promise<{
    trusteeName: string;
    userName: string;
    requesterName: string;
    requesterEmail: string;
    relationship: string;
    verificationMethod: string;
    hasDeathCertificate: boolean;
    requestDate: string;
  }> {
    return apiRequest(`/api/legacy-access/confirm?token=${token}`);
  },

  async submitConfirmation(data: {
    token: string;
    action: "confirm" | "deny";
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest("/api/legacy-access/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getContent(token: string): Promise<LegacyContent> {
    return apiRequest(`/api/legacy-access/grant?token=${token}`);
  },
};

// =============================================================================
// HELPER UTILITIES
// =============================================================================

/**
 * Convert a Blob to a base64 data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get file size from a base64 data URL (approximate)
 */
export function getBase64FileSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return 0;
  // Base64 is ~4/3 larger than binary
  return Math.round((base64.length * 3) / 4);
}
