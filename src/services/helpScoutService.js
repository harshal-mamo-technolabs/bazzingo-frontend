import axios from 'axios';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

export async function getHelpScoutSignature() {
  const userData = localStorage.getItem("user");
  if (!userData) {
    throw new Error("User not authenticated");
  }

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error("Invalid user data format");
  }

  const token = parsedUserData?.accessToken;
  if (!token) {
    throw new Error("Authentication token not found");
  }

  const apiUrl = `${API_CONNECTION_HOST_URL}/helpscout/user-signature`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    if (data.status === 'success' && data.data) {
      return {
        signature: data.data.signature,
        user: data.data.user,
        expiresAt: data.data.expiresAt
      };
    } else {
      throw new Error("Invalid response format from backend");
    }

  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        if (data?.message === "Authentication required") {
          throw new Error("Authentication required");
        } else if (data?.message === "Invalid token") {
          throw new Error("Authentication token expired or invalid");
        } else {
          throw new Error(`Authentication failed: ${data?.message || 'Unknown error'}`);
        }
      } else if (status === 500) {
        if (data?.message?.includes("Help Scout")) {
          throw new Error(data.message);
        } else {
          throw new Error(`Help Scout service error: ${data?.message || 'Something went wrong'}`);
        }
      } else {
        throw new Error(`Server error (${status}): ${data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      throw new Error("Network connection failed - please check your internet connection");
    } else {
      throw new Error(`Failed to fetch Help Scout signature: ${error.message}`);
    }
  }
}
