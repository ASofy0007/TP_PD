import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Movie {
  _id: string;
  title: string;
  genre: string;
  releaseYear: number;
}

export interface HistoryEntry {
  _id: string;
  userId: string;
  movieId: string | Movie;
  watchedAt: string;
  movie?: Movie;
  title?: string;
}

export const UsersAPI = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  create: (data: { name: string; email: string }) =>
    api.post<User>("/users", data).then((r) => r.data),
  history: (id: string) =>
    api.get<HistoryEntry[]>(`/users/${id}/history`).then((r) => r.data),
  login: async (data: { email: string; name?: string }) => {
    const res = await api.post("/users/login", data);
    return res.data;
  },
  update: async (id: string, data: { name: string }) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export const MoviesAPI = {
  list: () => api.get<Movie[]>("/movies").then((r) => r.data),
  create: (data: Partial<Movie>) =>
    api.post<Movie>("/movies", data).then((r) => r.data),
  update: (id: string, data: Partial<Movie>) =>
    api.put<Movie>(`/movies/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/movies/${id}`).then((r) => r.data),
};

export const HistoryAPI = {
  watch: (data: { userId: string; movieId: string; watchedAt?: string }) =>
    api.post<HistoryEntry>("/history/watch", data).then((r) => r.data),
  unwatched: (userId: string) =>
    api.get<Movie[]>(`/history/unwatched/${userId}`).then((r) => r.data),
  update: (id: string, data: { watchedAt: string }) =>
    api.put<HistoryEntry>(`/history/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/history/${id}`).then((r) => r.data),
};

// Helpers to normalize history entry shape (backend may populate `movieId` or `movie`)
export function getHistoryMovie(entry: HistoryEntry): Movie | null {
  if (entry.movie) return entry.movie;
  if (typeof entry.movieId === "object" && entry.movieId !== null) return entry.movieId as Movie;
  return null;
}
export function getHistoryMovieId(entry: HistoryEntry): string {
  if (typeof entry.movieId === "string") return entry.movieId;
  if (entry.movieId && typeof entry.movieId === "object") return (entry.movieId as Movie)._id;
  return "";
}
