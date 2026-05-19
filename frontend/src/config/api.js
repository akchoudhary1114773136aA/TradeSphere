const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3003";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const saveSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem("stocklyToken", token);
  }

  if (user) {
    localStorage.setItem("stocklyUser", JSON.stringify(user));
  }
};

export const getToken = () => localStorage.getItem("stocklyToken");

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
