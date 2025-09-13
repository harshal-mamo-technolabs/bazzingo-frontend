import axios from 'axios';
import { API_CONNECTION_HOST_URL, DASHBOARD_ENDPOINT, PROGRESS_CHART_ENDPOINT, STREAK_ENDPOINT, DAILY_GAMES_ENDPOINT, ASSESSMENT_ENDPOINT,QUICK_ASSESSMENT_ENDPOINT, SUBMIT_ASSESSMENT_ENDPOINT, PLANS_ENDPOINT  } from "../utils/constant";

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

    // Always pass filters when provided to enable combined filtering across scopes
    if (country) {
      url += `&country=${encodeURIComponent(country)}`;
    }

    if (ageGroup) {
      url += `&ageGroup=${encodeURIComponent(ageGroup)}`;
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

// Fetch recent assessment activity (latest scores)
export async function getRecentAssessmentActivity() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/assessment/recent-activity`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching recent assessment activity:", err);
    throw err;
  }
}

// Fetch dashboard recent activity (games/assessments with percentage)
export async function getRecentDashboardActivity() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/dashboard/recent-activity`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching dashboard recent activity:", err);
    throw err;
  }
}

// Fetch game statistics (rank, totals, category breakdowns)
export async function getGameStatistics() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/game/statistics`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching game statistics:", err);
    throw err;
  }
}

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

// Quick Assessment (10 questions from /assessment/quick)
export async function getQuickAssessment() {
  try {
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${QUICK_ASSESSMENT_ENDPOINT}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quick assessment:", error);
    throw error;
  }
}

// Full Assessment (30 questions from /assessment/:id)
export async function getFullAssessment(assessmentId) {
  try {
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${ASSESSMENT_ENDPOINT}/${assessmentId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching full assessment:", error);
    throw error;
  }
}

// All Assessment (all assessments from /assessment)
export async function getAllAssessment() {
  try {
    const response = await axios.get(`${API_CONNECTION_HOST_URL}${ASSESSMENT_ENDPOINT}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all assessment:", error);
    throw error;
  }
}

// Submit Assessment
export async function submitAssessment(payload) {
  try {
    const response = await axios.post(
      `${API_CONNECTION_HOST_URL}${SUBMIT_ASSESSMENT_ENDPOINT}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting assessment:", error);
    throw error;
  }
}

export async function getUserProfile() {
  const userData = localStorage.getItem("user");
  if (!userData) throw new Error("User not authenticated");

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error("Invalid User Data. Please log in again: ", err);
  }

  const token = parsedUserData?.accessToken;
  if (!token) throw new Error("Authentication token not found");

  const response = await axios.get(`${API_CONNECTION_HOST_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateUserProfile(profileData) {
  const userData = localStorage.getItem("user");
  if (!userData) throw new Error("User not authenticated");

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error("Invalid User Data. Please log in again: ", err);
  }

  const token = parsedUserData?.accessToken;
  if (!token) throw new Error("Authentication token not found");

  const response = await axios.put(`${API_CONNECTION_HOST_URL}/user`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export async function getPlansData(){
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

  const response = await axios.get(`${API_CONNECTION_HOST_URL}${PLANS_ENDPOINT}`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
  return response.data;
}

// Fetch user IQ scores
export async function getUserIqScores() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/assessment/program-score`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching user IQ scores:", err);
    throw err;
  }
}

// Fetch user program scores (IQ + Driving License)
export async function getUserProgramScores() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/assessment/program-score`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching user program scores:", err);
    throw err;
  }
}

// Fetch daily assessment purchase recommendation
export async function getDailyAssessmentRecommendation() {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) throw new Error("No token found");

    const url = `${API_CONNECTION_HOST_URL}/assessment/daily-assessment-purchase-recommendation`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching daily assessment recommendation:", err);
    throw err;
  }
}


const ASSESSMENT_STATISTICS_ENDPOINT = '/assessment/statistics';

export async function getAssessmentStatistics() {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("User not authenticated");

    let parsedUserData;
    try {
        parsedUserData = JSON.parse(userData);
    } catch (err) {
        throw new Error("Invalid User Data. Please log in again: ", err);
    }

    const token = parsedUserData?.accessToken;
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.get(
        `${API_CONNECTION_HOST_URL}${ASSESSMENT_STATISTICS_ENDPOINT}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

const USER_PREFERENCES_ENDPOINT = '/user/preferences';

export async function updateUserPreferences(preferencesData) {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("User not authenticated");

    let parsedUserData;
    try {
        parsedUserData = JSON.parse(userData);
    } catch (err) {
        throw new Error("Invalid User Data. Please log in again: ", err);
    }

    const token = parsedUserData?.accessToken;
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.put(
        `${API_CONNECTION_HOST_URL}${USER_PREFERENCES_ENDPOINT}`,
        preferencesData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
}