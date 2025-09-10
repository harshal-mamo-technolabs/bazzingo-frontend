import axios from 'axios';
import { API_CONNECTION_HOST_URL, GAMES_ENDPOINT, GAME_SCORE_ENDPOINT, DAILY_SUGGESTIONS_ENDPOINT } from "../utils/constant";

function getAuthHeaders() {
  const userData = localStorage.getItem("user");
  if (!userData) throw new Error("User not authenticated");

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error("Invalid User Data. Please log in again");
  }

  const token = parsedUserData?.accessToken;
  if (!token) throw new Error("Authentication token not found");

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Fetch all games
export async function getAllGames() {
  try {
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${GAMES_ENDPOINT}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}

// Submit game score
export async function submitGameScore(gameId, score) {
  try {
    const payload = {
      gameId,
      score
    };
    
    const response = await axios.post(
      `${API_CONNECTION_HOST_URL}${GAME_SCORE_ENDPOINT}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting game score:", error);
    throw error;
  }
}

// Get daily game suggestions
export async function getDailySuggestions() {
  try {
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${DAILY_SUGGESTIONS_ENDPOINT}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching daily suggestions:", error);
    throw error;
  }
}
