const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // padroniza erro
    throw new Error(data?.message || "Erro na requisição");
  }

  return data;
}
