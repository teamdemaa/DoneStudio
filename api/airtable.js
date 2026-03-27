import Airtable from 'airtable';

export default async function handler(req, res) {
  // Configurer Airtable avec les variables d'environnement (SANS VITE_)
  const apiKey = process.env.AIRTABLE_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: "Missing Airtable configuration on server" });
  }

  const { table, fields, sort } = req.query;
  
  const base = new Airtable({ apiKey }).base(baseId);

  try {
    const selectOptions = {};
    if (fields) selectOptions.fields = JSON.parse(fields);
    if (sort) selectOptions.sort = JSON.parse(sort);

    const records = await base(table).select(selectOptions).firstPage();
    
    // Renvoyer les données formatées pour le frontend
    const formattedRecords = records.map(record => ({
      id: record.id,
      fields: record.fields
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error('Airtable Error:', error);
    res.status(500).json({ error: error.message });
  }
}
