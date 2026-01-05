// Enums
export enum Role {
  APPRENANT = 'APPRENANT',
  FORMATEUR_ADMIN = 'FORMATEUR_ADMIN',
  ADMIN = 'ADMIN'
}

export enum ClientType {
  PRESENTIEL = 'PRESENTIEL',
  EN_LIGNE = 'EN_LIGNE'
}

export enum AccessType {
  MANUAL = 'MANUAL',
  VIDEO = 'VIDEO',
  EXERCISE = 'EXERCISE'
}

export enum Level {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE'
}

export enum ExerciseType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  QUIZ = 'QUIZ'
}

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  SUPPORT = 'SUPPORT',
  CELEBRATE = 'CELEBRATE'
}

// Types de formulaires
export type FormationFormData = {
  title: string
  description: string
  category: string
  level: Level
  accessType: AccessType
  targetClientType?: ClientType
}

export type PostFormData = {
  content: string
}

export type CommentFormData = {
  content: string
}

export type MessageFormData = {
  receiverId: string
  content: string
}

export type CoachingNoteFormData = {
  clientId: string
  title: string
  content: string
  isVisible: boolean
}

export type ModuleFormData = {
  title: string
  description?: string
  order: number
}

export type ExerciseFormData = {
  title: string
  description: string
  type: ExerciseType
  required: boolean
  order: number
}

// Catégories de formation
export const FORMATION_CATEGORIES = [
  'Développement Web',
  'Design',
  'Marketing Digital',
  'Business',
  'Photographie',
  'Langues',
  'Développement Personnel',
  'Santé & Bien-être',
  'Musique',
  'Autre'
] as const

// Labels pour l'UI
export const ROLE_LABELS: Record<Role, string> = {
  [Role.APPRENANT]: 'Apprenant',
  [Role.FORMATEUR_ADMIN]: 'Formateur',
  [Role.ADMIN]: 'Administrateur'
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  [ClientType.PRESENTIEL]: 'Présentiel',
  [ClientType.EN_LIGNE]: 'En ligne'
}

export const ACCESS_TYPE_LABELS: Record<AccessType, string> = {
  [AccessType.MANUAL]: 'Validation manuelle',
  [AccessType.VIDEO]: 'Après visionnage vidéos',
  [AccessType.EXERCISE]: 'Après validation exercices'
}

export const LEVEL_LABELS: Record<Level, string> = {
  [Level.DEBUTANT]: 'Débutant',
  [Level.INTERMEDIAIRE]: 'Intermédiaire',
  [Level.AVANCE]: 'Avancé'
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  [ExerciseType.TEXT]: 'Texte libre',
  [ExerciseType.FILE]: 'Upload de fichier',
  [ExerciseType.QUIZ]: 'Quiz'
}

export const REACTION_TYPE_LABELS: Record<ReactionType, string> = {
  [ReactionType.LIKE]: '👍',
  [ReactionType.LOVE]: '❤️',
  [ReactionType.SUPPORT]: '🙌',
  [ReactionType.CELEBRATE]: '🎉'
}