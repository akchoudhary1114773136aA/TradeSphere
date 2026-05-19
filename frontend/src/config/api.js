const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const saveSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem("stockly_token", token);
  }

  if (user) {
    localStorage.setItem("stockly_user", JSON.stringify(user));
  }
};

export const getToken = () => localStorage.getItem("stockly_token");

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
