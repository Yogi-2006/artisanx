export type EnquiryStatus = 'new' | 'viewed' | 'responded' | 'closed';

export interface Enquiry {
    id: string;
    product_id: string;
    buyer_id: string;
    quantity: number;
    status: EnquiryStatus;
}
