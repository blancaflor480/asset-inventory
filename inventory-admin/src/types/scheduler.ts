export interface Asset {
id?: number;
room_name: string;
booked_by: string;
purpose: string;
start_time: string;
end_time: string;
status: string; // Pending, Approved, Rejected, Cancelled
approver_id?: number; // ID of the user who approved/rejected the booking   
created_at?: string;
updated_at?: string;
}
