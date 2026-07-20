export interface Article {
    id: number;
    expert_id: number;
    title: string;
    content: string;
    image_url: string;
    summary: string | null;
    published_date: string | null;
    author: string;
  }
  
  export interface ArticleListItem {
    id: number;
    title: string;
    summary: string | null;
    image_url: string;
    published_date: string | null;
    author: string;
  }