// src/auth/enums/user.enums.ts
export enum UserRole {
  EMPLOYEE = 'Employee',
  ADMIN = 'Admin',
}

export enum UserPoste {
  TECHNICIEN = 'Technicien',
  MANAGER = 'Manager',
  OPERATOR = 'Operator',
  SUPERVISEUR = 'Superviseur',
  ADMINISTRATEUR = 'Administrateur',
}

export enum UserDepartement {
  TECHNIQUE = 'Technique',
  MANAGEMENT = 'Management',
  PRODUCTION = 'Production',
  QUALITE = 'Qualité',
  ADMINISTRATION = 'Administration',
}

// Types pour TypeScript
export interface UserCreateData {
  nom: string;
  email: string;
  motdepasse: string;
  role: UserRole;
  poste: UserPoste;
  departement: UserDepartement;
}

export interface UserUpdateData {
  nom?: string;
  poste?: UserPoste;
  departement?: UserDepartement;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  user: {
    nom: string;
    email: string;
    role: UserRole;
    poste: UserPoste;
    departement: UserDepartement;
  };
}