import Airtable from 'airtable';

export default async function handler(req, res) {
  // Configurer Airtable avec les variables d'environnement (SANS VITE_)
  const apiKey = process.env.AIRTABLE_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: "Missing Airtable configuration on server" });
  }

  const method = req.method;

  try {
    const base = new Airtable({ apiKey }).base(baseId);

    if (method === 'GET') {
      const { table, fields, sort } = req.query;
      const selectOptions = {};
      if (fields) selectOptions.fields = JSON.parse(fields);
      if (sort) selectOptions.sort = JSON.parse(sort);

      const records = await base(table).select(selectOptions).firstPage();
      const formattedRecords = records.map(record => ({
        id: record.id,
        fields: record.fields
      }));
      return res.status(200).json(formattedRecords);
    }

    if (method === 'POST') {
      const { table, fields } = req.body;
      if (!table || !fields) {
        return res.status(400).json({ error: 'Missing table or fields' });
      }

      const record = await base(table).create(fields);
      return res.status(200).json({ id: record.id, fields: record.fields });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Airtable Error:', error);
    res.status(500).json({ error: error.message });
  }
}
