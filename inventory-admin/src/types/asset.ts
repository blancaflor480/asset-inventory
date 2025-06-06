export interface Asset {
  id?: number;
  sn_description: string;
  tag_id?: string; // Auto-generated MLCA ID
  category: string;
  dept_area: string;
  office: string;
  designation: string;
  assignee: string;
  email_address: string;
  password?: string;
  date_issued: string;
  mobile_number: string;
  chain_of_ownership?: string;
  previous_owner?: string;
  remarks_date?: string;
  supplier?: string;
  warranty_expiration?: string;
  status?: string;
  condition_status?: string;
  unit_value: number;
  qty: number;
  total_value?: number;
  model_no?: string;
  serial_no?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}