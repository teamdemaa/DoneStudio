// Utilise maintenant les Vercel Functions (/api/airtable.js) pour plus de sécurité
// Les clés ne sont plus stockées ni utilisées côté client.

const fetchFromAirtable = async (table, options = {}) => {
  const params = new URLSearchParams({ table });
  if (options.fields) params.append('fields', JSON.stringify(options.fields));
  if (options.sort) params.append('sort', JSON.stringify(options.sort));

  const response = await fetch(`/api/airtable?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Erreur Airtable Proxy: ${response.status}`);
  }
  return response.json();
};

export const getProjets = async () => {
  try {
    const data = await fetchFromAirtable('Projets', {
      fields: ['Name', 'Description', 'Catégorie', 'Statut', 'Rejoindre ce projet']
    });
    
    return data.map(record => ({
      id: record.id,
      name: record.fields['Name'],
      description: record.fields['Description'],
      category: record.fields['Catégorie'],
      status: record.fields['Statut'],
      link: record.fields['Rejoindre ce projet']
    }));
  } catch (error) {
    console.error('Error fetching Projets:', error);
    return [];
  }
};

export const getModeles = async () => {
  try {
    const data = await fetchFromAirtable('Modèles', {
      fields: ['Name', 'Description', 'Catégorie', 'Image', 'Lien', 'Outil']
    });
    return data.map(record => ({
      id: record.id,
      name: record.fields['Name'],
      description: record.fields['Description'],
      category: record.fields['Catégorie'],
      images: record.fields['Image']?.map(img => img.url) || [],
      link: record.fields['Lien'],
      tool: record.fields['Outil']
    }));
  } catch (error) {
    console.error('Error fetching Modèles:', error);
    return [];
  }
};

export const getOutils = async () => {
  try {
    const data = await fetchFromAirtable('Outils', {
      fields: ['Name', 'Description', 'Catégorie', 'Lien']
    });
    return data.map(record => ({
      id: record.id,
      name: record.fields['Name'],
      description: record.fields['Description'],
      category: record.fields['Catégorie'],
      link: record.fields['Lien']
    }));
  } catch (error) {
    console.error('Error fetching Outils:', error);
    return [];
  }
};

export const getRessources = async () => {
  try {
    const data = await fetchFromAirtable('Ressources', {
      fields: ['Name', 'Catégorie', 'Description', 'Lien', 'Créateur', 'Type']
    });
    return data.map(record => ({
      id: record.id,
      name: record.fields['Name'],
      category: record.fields['Catégorie'],
      description: record.fields['Description'],
      link: record.fields['Lien'],
      creator: record.fields['Créateur'],
      type: record.fields['Type']
    }));
  } catch (error) {
    console.error('Error fetching Ressources:', error);
    return [];
  }
};

export const getAcademie = async () => {
  try {
    const data = await fetchFromAirtable('Académie', {
      fields: ['name', 'description', 'category', 'image', 'Lien'],
      sort: [{ field: 'name', direction: 'asc' }]
    });
    return data.map(record => ({
      id: record.id,
      name: record.fields['name'],
      description: record.fields['description'],
      category: record.fields['category'] ? record.fields['category'][0] : '',
      image: record.fields['image'] ? record.fields['image'][0].url : null,
      videoUrl: record.fields['Lien']
    }));
  } catch (error) {
    console.error('Error fetching Académie:', error);
    return [];
  }
};

export const saveGeneration = async (projectName, strategyJson) => {
  const response = await fetch('/api/airtable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      table: 'Generations',
      fields: {
        'Project': projectName,
        'Strategy': JSON.stringify(strategyJson),
        'Date': new Date().toISOString()
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('Save failed:', response.status, errorBody);
    throw new Error('Impossible de sauvegarder sur Airtable');
  }

  return response.json();
};
