const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
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
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Méthodes PUT
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
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

  async createEvent(eventData) {
    return this.post("/evenements", eventData);
  }

  async updateEvent(id, eventData) {
    return this.put(`/evenements/${id}`, eventData);
  }

  async deleteEvent(id) {
    return this.delete(`/evenements/${id}`);
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

  async createTenant(tenantData) {
    return this.post("/tenants", tenantData);
  }

  async updateTenant(id, tenantData) {
    return this.put(`/tenants/${id}`, tenantData);
  }

  async deleteTenant(id) {
    return this.delete(`/tenants/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;
