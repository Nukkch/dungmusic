const parserService = require('../services/parserService');

exports.getTracks = async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.runParser = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    const tracks = await parserService.parse(query);
    res.json(tracks);
  } catch (err) {
    console.error('Parser error:', err);
    res.status(500).json({ error: err.message });
  }
};