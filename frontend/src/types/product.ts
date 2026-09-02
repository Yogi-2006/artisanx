export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Product {
    id: string;
    artisan_id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    price: number;
    status: ProductStatus;
    readiness_score: number;
}
