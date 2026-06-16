import axios from "axios";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
| Production:
| https://mindcare-ai-3.onrender.com/api/v1
|
| Local:
| http://localhost:5000/api/v1
|--------------------------------------------------------------------------
*/

const API =
  import.meta.env.VITE_API_URL ||
  "https://mindcare-ai-3.onrender.com/api/v1";

/*
|--------------------------------------------------------------------------
| Generate Mood Insights
|--------------------------------------------------------------------------
*/

export async function generateMoodInsights(data) {
  try {
    const response = await axios.post(
      `${API}/ai/mood-insights`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI Insights Error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      predictions: [
        {
          title: "AI Analysis Offline",
          value: "--",
          text: "Unable to fetch emotional insights right now.",
        },
      ],
    };
  }
}

export default generateMoodInsights;