import axios from 'axios';

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export async function generateMoodInsights(data) {
  try {
    const response = await axios.post(
      `${API}/ai/mood-insights`,
      data
    );

    return response.data;
  } catch (error) {
    console.error(error);

    return {
      predictions: [
        {
          title: 'AI Analysis Offline',
          value: '--',
          text: 'Unable to fetch emotional insights right now.'
        }
      ]
    };
  }
}