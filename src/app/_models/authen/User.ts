export class User {
    id?: string;
    org_id?: string;
    title_id?: string;
    full_name?: string;
    birth_date?: string;
    gender_id?: number;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    phone?: string;
    work_phone?: string;
    email?: string;
    address?: string;
    username?: string;
    password?: string;
    confirm_password?: string;
    avatar?: string;
    signature?: string;
    is_org_present?: Boolean;
    status?: Boolean= true;
    is_delegate?: Boolean;
    is_chair?: Boolean;
    is_secretary?: Boolean;
    is_approve_user?: Boolean;
    is_tracking_specialist?: Boolean;
    user_type?: number;
    org_manage_id?: string;
    org_name?: string;
    list_groups: Array<any>;
    list_group2s: Array<string>;
    list_clients: Array<any>;
    list_client2s: Array<string>;

    list_org_manages: Array<any>;
    list_org_manage2s: Array<string>;
};

