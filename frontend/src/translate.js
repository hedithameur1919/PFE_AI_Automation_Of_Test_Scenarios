import axios from 'axios';

// Function to translate text to French using Google Translate API from RapidAPI
export async function translateToFrench(text) {
  const options = {
    method: 'POST',
    url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
    headers: {
      'x-rapidapi-key': 'e46ce5d106msh82e1b8eab9a3677p1866b8jsnc8d17afaf613', // your RapidAPI key
      'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      from: 'en',
      to: 'fr',
      text: text
    }
  };

  try {
    const response = await axios.request(options);
    console.log("Translated text:", response.data.trans);
    return response.data.trans; // return the translated text
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
