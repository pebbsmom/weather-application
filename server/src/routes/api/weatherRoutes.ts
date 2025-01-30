import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';
const router = Router();
// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }
  try {
    const weatherData = await WeatherService.getWeatherforCity(cityName);
    await HistoryService.addCity(cityName);
    return res.status(200).json(weatherData);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'City ID is required' });
  }
  try {
    await HistoryService.removeCity(id);
    return res.status(200).json({ message: 'City deleted from history' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});



export default router;
