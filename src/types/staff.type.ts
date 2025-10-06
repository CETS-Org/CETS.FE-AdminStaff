    export interface UpdateStaffProfile{
        fullName: string | null;
        email: string | null;
        phoneNumber: string | null;
        dateOfBirth: string | null;
        address: string | null;
        cid: string | null;
        avatarUrl: string | null;
    }
    export interface AddStaffProfile{
        email: string | null;
        phoneNumber: string | null;
        fullName: string | null;
        dateOfBirth: string | null;
        address: string | null;
        cid: string | null;
        avatarUrl: string | null;
        roleID: string | null;
    }