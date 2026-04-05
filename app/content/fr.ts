import type { Content } from './types'

const fr: Content = {
  navLinks: [
    { label: 'Fonctionnalités', section: 'features' },
    { label: 'Histoire', section: 'story' },
    { label: 'Comment ça marche', section: 'how-it-works' },
    { label: 'Communauté', section: 'community' },
  ],
  chapters: [
    { emoji: '😰', time: '18h47', title: 'L\'appel qui change tout.', body: 'Elle devait être rentrée à 17h. Les mains de Sarah tremblaient en composant le numéro de sa fille pour la huitième fois. Pas de réponse. L\'école a dit qu\'elle était partie il y a deux heures. Les rues s\'assombrissaient.', color: '#ef4444', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80' },
    { emoji: '📍', time: '18h52', title: 'Un seul appui. Sa dernière position.', body: 'Sarah a ouvert SafeCircle. La carte s\'est allumée — le traceur d\'Emma avait émis un signal à 3 rues de l\'école à 17h12, puis s\'est tu. Elle a partagé la position avec la communauté instantanément.', color: '#4F6EF7', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
    { emoji: '🤝', time: '19h04', title: 'La communauté répond.', body: 'En quelques minutes, 23 voisins avaient vu l\'alerte. Un commerçant local a répondu : "J\'ai vu une fille correspondant à cette description près du parc." L\'IA l\'a signalé comme une observation à haute confiance.', color: '#22c55e', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
    { emoji: '🏃', time: '19h19', title: 'Équipe de recherche, coordonnée.', body: 'Six bénévoles ont lancé une équipe de recherche depuis l\'application. Chacun assigné à une zone sur la carte en direct. Enregistrements en temps réel. Pas de chevauchement. Pas de temps perdu.', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80' },
    { emoji: '💙', time: '19h31', title: 'Emma a été retrouvée saine et sauve.', body: 'Elle s\'était tordu la cheville et s\'était abritée dans une entrée. Un bénévole l\'a trouvée à 800 mètres du dernier signal. Sarah a marqué le post comme résolu. La communauté a célébré. 44 minutes, du début à la fin.', color: '#a855f7', img: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80' },
  ],
  features: [
    { icon: '📍', title: 'Suivi GPS en direct', desc: 'Mises à jour de localisation en temps réel toutes les 30 secondes. Voyez exactement où se trouvent vos proches.', color: '#4F6EF7', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80' },
    { icon: '🔔', title: 'Alertes de zones intelligentes', desc: 'Dessinez des zones sûres sur une carte. Recevez des alertes instantanées dès qu\'une personne entre ou sort.', color: '#22c55e', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
    { icon: '🤖', title: 'Assistant IA', desc: 'Posez des questions en langage naturel : "Ana est-elle en sécurité ?" — L\'IA répond depuis vos données en direct.', color: '#a855f7', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80' },
    { icon: '🤝', title: 'Fils communautaires', desc: 'Publiez des alertes de personnes disparues, des observations et des mises à jour. L\'IA catégorise automatiquement chaque publication.', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' },
    { icon: '🗺️', title: 'Équipe de recherche', desc: 'Coordonnez les bénévoles avec des cartes en direct, des assignations de zones et des enregistrements en temps réel.', color: '#ef4444', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80' },
    { icon: '🔒', title: 'Confidentialité par conception', desc: 'Vos données de traceur vous appartiennent. La sécurité au niveau des lignes signifie qu\'aucun autre utilisateur ne peut voir vos emplacements.', color: '#06b6d4', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80' },
  ],
  steps: [
    { n: '01', icon: '📲', title: 'Télécharger et s\'inscrire', desc: 'Créez votre compte en 60 secondes avec email ou Google. Votre profil est prêt instantanément.', color: '#4F6EF7' },
    { n: '02', icon: '📡', title: 'Enregistrer un traceur', desc: 'Entrez l\'ID de votre appareil et le code de couplage. Le traceur GPS est lié à votre compte immédiatement.', color: '#a855f7' },
    { n: '03', icon: '🗺️', title: 'Dessiner des zones sûres', desc: 'Appuyez sur la carte pour placer des zones autour de la maison, de l\'école, du travail.', color: '#22c55e' },
    { n: '04', icon: '👥', title: 'Rejoindre la communauté', desc: 'Connectez-vous avec vos voisins. Publiez des alertes, répondez aux observations, coordonnez des équipes de recherche.', color: '#f59e0b' },
    { n: '05', icon: '🤖', title: 'Laisser l\'IA aider', desc: 'Posez à votre assistant IA n\'importe quelle question sur vos données. Obtenez des résumés intelligents.', color: '#ef4444' },
  ],
}

export default fr
