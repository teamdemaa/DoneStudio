import Airtable from 'airtable';

const base = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN
}).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

export const getProjets = async () => {
  try {
    const records = await base('Projets').select({
      fields: ['Name', 'Description', 'Catégorie', 'Statut', 'Rejoindre ce projet'],
      pageSize: 50
    }).firstPage();
    
    return records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      description: record.get('Description'),
      category: record.get('Catégorie'),
      status: record.get('Statut'),
      link: record.get('Rejoindre ce projet')
    }));
  } catch (error) {
    console.error('Error fetching Projets:', error);
    return [];
  }
};

export const getModeles = async () => {
  try {
    const records = await base('Modèles').select({
      fields: ['Name', 'Description', 'Catégorie', 'Image', 'Lien', 'Outil'],
      pageSize: 20
    }).firstPage();
    return records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      description: record.get('Description'),
      category: record.get('Catégorie'),
      images: record.get('Image')?.map(img => img.url) || [],
      link: record.get('Lien'),
      tool: record.get('Outil')
    }));
  } catch (error) {
    console.error('Error fetching Modèles:', error);
    return [];
  }
};

export const getOutils = async () => {
  try {
    const records = await base('Outils').select({
      fields: ['Name', 'Description', 'Catégorie', 'Lien'],
      pageSize: 20
    }).firstPage();
    return records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      description: record.get('Description'),
      category: record.get('Catégorie'),
      link: record.get('Lien')
    }));
  } catch (error) {
    console.error('Error fetching Outils:', error);
    return [];
  }
};

export const getRessources = async () => {
  try {
    const records = await base('Ressources').select({
      fields: ['Name', 'Catégorie', 'Description', 'Lien', 'Créateur', 'Type'],
      pageSize: 20
    }).firstPage();
    return records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      category: record.get('Catégorie'),
      description: record.get('Description'),
      link: record.get('Lien'),
      creator: record.get('Créateur'),
      type: record.get('Type')
    }));
  } catch (error) {
    console.error('Error fetching Ressources:', error);
    return [];
  }
};

export const getAcademie = async () => {
  try {
    const records = await base('Académie').select({
      fields: ['name', 'description', 'category', 'image', 'Lien'],
      sort: [{ field: 'name', direction: 'asc' }]
    }).firstPage();
    return records.map(record => ({
      id: record.id,
      name: record.get('name'),
      description: record.get('description'),
      category: record.get('category') ? record.get('category')[0] : '',
      image: record.get('image') ? record.get('image')[0].url : null,
      videoUrl: record.get('Lien')
    }));
  } catch (error) {
    console.error('Error fetching Académie:', error);
    return [];
  }
};
