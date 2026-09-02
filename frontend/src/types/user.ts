export type Role = 'artisan' | 'buyer' | 'facilitator';
export type Language = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'ur';
export type GuidanceLevel = 'beginner' | 'intermediate' | 'experienced';

export interface User {
    id: string;
    phone: string;
    email: string;
    role: Role;
    display_name: string;
    preferred_language: Language;
    guidance_level: GuidanceLevel;
    created_at: string;
}
