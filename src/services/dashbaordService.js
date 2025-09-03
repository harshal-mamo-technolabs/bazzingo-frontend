import axios from 'axios';
import { API_CONNECTION_HOST_URL, DASHBOARD_ENDPOINT, PROGRESS_CHART_ENDPOINT, STREAK_ENDPOINT, DAILY_GAMES_ENDPOINT } from "../utils/constant";

export async function getDashboardData(){
    const userData = localStorage.getItem("user");
    if(!userData) throw new Error("User not authenticated");

    let parsedUserData;
    try{
        parsedUserData = JSON.parse(userData);
    }
    catch(err){
        throw new Error("Invalid User Data. Please log in again: ",err);
    }

    const token = parsedUserData?.accessToken;
    if(!token) throw new Error("Authentication token not found");

    const response = await axios.get(`${API_CONNECTION_HOST_URL}${DASHBOARD_ENDPOINT}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

export async function getWeeklyScores() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${PROGRESS_CHART_ENDPOINT}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly scores:", error);
    throw error;
  }
}

export async function getStreak(startDate, endDate){
  try{
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if(!token) throw new Error("No token found");

    let url = `${API_CONNECTION_HOST_URL}${STREAK_ENDPOINT}`;
    if(startDate && endDate){
      url +=`?startDate=${startDate}&endDate=${endDate}`; 
    }
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;

  }
  catch(error){
    console.error("Error fetching details: ",error);
    throw error;
  }
}

export async function getDailyGames() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${DAILY_GAMES_ENDPOINT}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching daily games:", error);
    throw error;
  }
}

export async function getLeaderboard({ scope = "global", page = 1, limit = 20, country, ageGroup }) {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    let url = `${API_CONNECTION_HOST_URL}/leaderboard?scope=${scope}&page=${page}&limit=${limit}`;

    if (scope === "country" && country) {
      url += `&country=${country}`;
    }

    if (scope === "age" && ageGroup) {
      url += `&ageGroup=${ageGroup}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    throw err;
  }
}