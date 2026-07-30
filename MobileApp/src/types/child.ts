export interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number; // in cm
  weight: number; // in kg
  allergies?: string[];
  createdAt?: string;
  updatedAt?: string;
}
