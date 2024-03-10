export class UserGroup {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    is_org_permission?: Boolean;
    status?: number;
    user_type_id?: number;
    userGroupPermissions?: Array<UserGroupPermission>;
};

export class UserGroupPermission {
    id?: string;
    user_group_id?: string;
    action_id?: string;
    action_name?: string;
    function_id?: string;
    function_name?: string;
}
