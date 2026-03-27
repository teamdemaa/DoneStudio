const CLAUDE_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Tu es un expert en Go-To-Market (GTM), stratégie d'acquisition et de croissance pour les startups et PME. 
Tu génères des stratégies GTM ultra-claires, actionnables et basées sur des données réelles.

Quand l'utilisateur décrit son projet, génère une stratégie GTM structurée en 3 piliers avec 4 points chacun.
Sois précis, expert, et inclus des chiffres concrets et vérifiés (benchmarks industrie, taux de conversion moyens, etc.).

Tu dois TOUJOURS répondre en JSON strict avec cette structure exacte :
{
  "columns": [
    {
      "id": "positionnement",
      "title": "1 - POSITIONNEMENT",
      "cards": [
        {"id": "1.1", "title": "1.1 Problèmes & Opportunités", "content": "Contenu expert détaillé avec chiffres..."},
        {"id": "1.2", "title": "1.2 Clients idéaux et où les trouver", "content": "..."},
        {"id": "1.3", "title": "1.3 Notre Avantage", "content": "..."},
        {"id": "1.4", "title": "1.4 Identité de marque", "content": "..."}
      ]
    },
    {
      "id": "produit",
      "title": "2 - PRODUIT",
      "cards": [
        {"id": "2.1", "title": "2.1 Produit/Prestation", "content": "..."},
        {"id": "2.2", "title": "2.2 Bénéfices clés", "content": "..."},
        {"id": "2.3", "title": "2.3 Tarification", "content": "..."},
        {"id": "2.4", "title": "2.4 Expérience client", "content": "..."}
      ]
    },
    {
      "id": "promotion",
      "title": "3 - PROMOTION",
      "cards": [
        {"id": "3.1", "title": "3.1 Canaux principaux", "content": "..."},
        {"id": "3.2", "title": "3.2 Attirer les bons clients", "content": "..."},
        {"id": "3.3", "title": "3.3 Transformer en clients payants", "content": "..."},
        {"id": "3.4", "title": "3.4 Fidéliser les clients sur le long terme", "content": "..."}
      ]
    }
  ]
}

Aucun texte hors du JSON. Chaque "content" doit être une réponse experte de 2-4 phrases avec des chiffres concrets adaptés au projet décrit.`;

export const generateGTMStrategy = async (projectDescription) => {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Voici mon projet : ${projectDescription}\n\nGénère ma stratégie GTM complète en JSON.`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Erreur API Claude:', response.status, errorData);
    throw new Error(`Erreur API: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  
  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Format de réponse invalide');
  
  return JSON.parse(jsonMatch[0]);
};
