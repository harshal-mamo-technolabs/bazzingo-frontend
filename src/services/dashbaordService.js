import axios from 'axios';
import { API_CONNECTION_HOST_URL, DASHBOARD_ENDPOINT, PROGRESS_CHART_ENDPOINT } from "../utils/constant";

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