const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL || "http://localhost:3001/api";
    console.log("API Service initialized with baseURL:", this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Pour les réponses DELETE qui ne retournent pas de contenu
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Méthodes GET
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // Méthodes POST
  async post(endpoint, data) {
    // Si data est un FormData, ne pas le stringifier
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };

    return this.request(endpoint, {
      method: "POST",
      body,
      headers,
    });
  }

  // Méthodes PUT
  async put(endpoint, data) {
    // Si data est un FormData, ne pas le stringifier
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };

    return this.request(endpoint, {
      method: "PUT",
      body,
      headers,
    });
  }

  // Méthodes DELETE
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // Méthodes spécifiques pour l'authentification
  async login(credentials) {
    return this.post("/auth/login", credentials);
  }

  async register(userData) {
    return this.post("/auth/register", userData);
  }

  // Méthodes pour les événements
  async getEvents() {
    return this.get("/evenements");
  }

  async getEvent(id) {
    return this.get(`/evenements/${id}`);
  }

  async createEvent(data) {
    return this.post("/evenements", data);
  }

  async updateEvent(id, data) {
    return this.put(`/evenements/${id}`, data);
  }

  async deleteEvent(id) {
    return this.delete(`/evenements/${id}`);
  }

  async cancelEvent(id) {
    return this.put(`/evenements/${id}/annuler`, {});
  }

  async reactivateEvent(id) {
    return this.put(`/evenements/${id}/reactiver`, {});
  }

  // Méthodes pour l'inscription directe aux événements sociaux
  async inscrireEvent(eventId, membreId) {
    return this.post(`/evenements/${eventId}/inscrire`, {
      membre_id: membreId,
    });
  }

  async desinscrireEvent(eventId, membreId) {
    return this.delete(`/evenements/${eventId}/inscrire/${membreId}`);
  }

  async getEventParticipants(eventId) {
    return this.get(`/evenements/${eventId}/participants`);
  }

  async getUserEventInscription(eventId, membreId) {
    return this.get(`/evenements/${eventId}/inscription/${membreId}`);
  }

  // Méthodes pour les membres
  async getMembers() {
    return this.get("/membres");
  }

  async getMember(id) {
    return this.get(`/membres/${id}`);
  }

  async updateMember(id, memberData) {
    return this.put(`/membres/${id}`, memberData);
  }

  async deleteMember(id) {
    return this.delete(`/membres/${id}`);
  }

  async setResponsable(id) {
    return this.post(`/membres/${id}/set-responsable`);
  }

  async unsetResponsable(id) {
    return this.post(`/membres/${id}/unset-responsable`);
  }

  // Méthodes pour les catégories
  async getCategories() {
    return this.get("/categories");
  }

  async getCategory(id) {
    return this.get(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.post("/categories", categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // Méthodes pour les participations
  async getParticipations() {
    return this.get("/participations");
  }

  async getParticipationsByEvent(eventId) {
    return this.get(`/participations/evenement/${eventId}`);
  }

  async getParticipationsByMember(memberId) {
    return this.get(`/participations/membre/${memberId}`);
  }

  async createParticipation(participationData) {
    return this.post("/participations", participationData);
  }

  async updateParticipation(id, participationData) {
    return this.put(`/participations/${id}`, participationData);
  }

  async deleteParticipation(id) {
    return this.delete(`/participations/${id}`);
  }

  // Méthodes pour les articles
  async getArticles() {
    return this.get("/articles");
  }

  async getArticle(id) {
    return this.get(`/articles/${id}`);
  }

  async createArticle(articleData) {
    return this.post("/articles", articleData);
  }

  async updateArticle(id, articleData) {
    return this.put(`/articles/${id}`, articleData);
  }

  async deleteArticle(id) {
    return this.delete(`/articles/${id}`);
  }

  async archiveArticle(id) {
    return this.post(`/articles/${id}/archiver`);
  }

  async unarchiveArticle(id) {
    return this.post(`/articles/${id}/desarchiver`);
  }

  // Méthodes pour les tenants
  async getTenants() {
    return this.get("/tenants");
  }

  async getTenant(id) {
    return this.get(`/tenants/${id}`);
  }

  async getTenantBySlug(slug) {
    return this.get(`/tenants/slug/${slug}`);
  }

  async createTenant(tenantData) {
    return this.post("/tenants", tenantData);
  }

  async updateTenant(id, tenantData) {
    return this.put(`/tenants/${id}`, tenantData);
  }

  async deleteTenant(id) {
    return this.delete(`/tenants/${id}`);
  }

  // Méthodes pour les badges
  async getBadges() {
    return this.get("/badges");
  }

  async getBadge(id) {
    return this.get(`/badges/${id}`);
  }

  async createBadge(badgeData) {
    return this.post("/badges", badgeData);
  }

  async updateBadge(id, badgeData) {
    return this.put(`/badges/${id}`, badgeData);
  }

  async deleteBadge(id) {
    return this.delete(`/badges/${id}`);
  }

  async getBadgeAttributions(badgeId) {
    return this.get(`/badges/${badgeId}/attributions`);
  }

  async attribuerBadge(badgeId, membreId) {
    return this.post(`/badges/${badgeId}/attribuer`, { membre_id: membreId });
  }

  async retirerAttribution(attributionId) {
    return this.delete(`/badges/attributions/${attributionId}`);
  }

  async getMembreBadges(membreId) {
    return this.get(`/badges/membre/${membreId}`);
  }

  // Méthodes pour les tranches horaires
  async getTranches() {
    return this.get("/tranches");
  }

  async getTranche(id) {
    return this.get(`/tranches/${id}`);
  }

  async createTranche(trancheData) {
    return this.post("/tranches", trancheData);
  }

  async updateTranche(id, trancheData) {
    return this.put(`/tranches/${id}`, trancheData);
  }

  async deleteTranche(id) {
    return this.delete(`/tranches/${id}`);
  }

  async getTranchesByEvenement(evenementId) {
    return this.get(`/tranches/evenement/${evenementId}`);
  }

  async getTrancheInscriptions(trancheId) {
    return this.get(`/tranches/${trancheId}/inscriptions`);
  }

  async inscrireTranche(trancheId, membreId = null) {
    const data = membreId ? { membre_id: membreId } : {};
    return this.post(`/tranches/${trancheId}/inscrire`, data);
  }

  async desinscrireTranche(inscriptionId) {
    return this.delete(`/tranches/inscriptions/${inscriptionId}`);
  }

  // Méthodes pour les catégories d'événements
  async getEventCategories() {
    return this.get("/event-categories");
  }

  async getEventCategory(id) {
    return this.get(`/event-categories/${id}`);
  }

  async createEventCategory(categoryData) {
    return this.post("/event-categories", categoryData);
  }

  async updateEventCategory(id, categoryData) {
    return this.put(`/event-categories/${id}`, categoryData);
  }

  async deleteEventCategory(id) {
    return this.delete(`/event-categories/${id}`);
  }

  async getMembreInscriptions(membreId) {
    return this.get(`/tranches/membre/${membreId}`);
  }

  async getInscriptionsByMembre(membreId, evenementId) {
    return this.get(`/tranches/evenement/${evenementId}/membre/${membreId}`);
  }
}

export const apiService = new ApiService();
export default apiService;
