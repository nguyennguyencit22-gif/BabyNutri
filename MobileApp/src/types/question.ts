export interface QuestionAnswer {
  id?: string;
  content: string;
  expertName: string;
  answeredAt?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  category?: string;
  status?: 'Pending' | 'Answered';
  createdAt?: string;
  parentId?: string | number | null;
  parentName?: string;
  targetExpertId?: string | number | null;
  targetExpertName?: string | null;
  answer?: QuestionAnswer | null;
}

