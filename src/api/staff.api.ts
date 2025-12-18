import type { FilterUserParam } from "@/types/filter.type";
import { api, endpoint } from "./api";
import type { Account, Role } from "@/types/account.type";
import type { AddStaffProfile, UpdateStaffProfile } from "@/types/staff.type";

export const getStaffs = async (): Promise<Account[]> => {
    try {
      const url = `${endpoint.account}`;
      
      const academicStaff = await api.get<Account[]>(url, {
        params: {   
          RoleName: 'AcademicStaff',     
        },
      });
      const accountantStaff = await api.get<Account[]>(url, {
        params: {   
          RoleName: 'AccountantStaff',     
        },
      });     
    return  [...academicStaff.data, ...accountantStaff.data] as Account[];
    } catch (error) {
      console.error('Error fetching staffs:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response headers:", axiosError.response?.headers);
      }
      throw error;
    }
  };
  
  /**
   * Get a single student by ID
   */
  export const getStaffById = async (id: string): Promise<Account> => {
    try {
      const url = `${endpoint.account}/${id}`;
      const response = await api.get<Account>(url);
      return response.data as Account;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response headers:", axiosError.response?.headers);
      }
      throw error;
    }
  };
  
export const filterStaff  = async (filterParam: FilterUserParam): Promise<Account[]> => {
    try {
      // Get all staffs first
      const allStaffs = await getStaffs();
      
      // Apply filters
      let filteredStaffs = allStaffs.filter(staff => {
        // Filter by name
        if (filterParam.name && !staff.fullName.toLowerCase().includes(filterParam.name.toLowerCase())) {
          return false;
        }
        
        // Filter by email
        if (filterParam.email && staff.email && !staff.email.toLowerCase().includes(filterParam.email.toLowerCase())) {
          return false;
        }
        
        // Filter by phone number
        if (filterParam.phoneNumber && staff.phoneNumber && !staff.phoneNumber.includes(filterParam.phoneNumber)) {
          return false;
        }
        
        // Filter by status
        if (filterParam.statusName && staff.statusName !== filterParam.statusName) {
          return false;
        }
        
        // Filter by role
        if (filterParam.roleName && !staff.roleNames.includes(filterParam.roleName)) {
          return false;
        }
        
        return true;
      });
      
      // Apply sorting
      if (filterParam.sortOrder !== "" && filterParam.sortBy !== "") {
        filteredStaffs.sort((a, b) => {
          // Handle specific sortBy cases
          if (filterParam.sortBy === "name") {
            // Sort by fullName
            const aName = (a.fullName || "").toLowerCase();
            const bName = (b.fullName || "").toLowerCase();
            return filterParam.sortOrder === "asc" 
              ? aName.localeCompare(bName)
              : bName.localeCompare(aName);
          } else if (filterParam.sortBy === "email") {
            // Sort by email
            const aEmail = (a.email || "").toLowerCase();
            const bEmail = (b.email || "").toLowerCase();
            return filterParam.sortOrder === "asc" 
              ? aEmail.localeCompare(bEmail)
              : bEmail.localeCompare(aEmail);
          } else if (filterParam.sortBy === "createdat") {
            // Sort by createdAt
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return filterParam.sortOrder === "asc" ? aDate - bDate : bDate - aDate;
          } else {
            // Default fallback
            return 0;
          }
        });
      }
      
      return filteredStaffs;

    } catch (error) {
      console.error(`Error filter staff with filterParam: ${filterParam}:`, error);
      throw error;
    }
  }

export const updateStaffProfile = async (id: string, staffData: UpdateStaffProfile): Promise<Account> => {
  try {
    const response = await api.patch<Account>(`${endpoint.account}/${id}/profile`, staffData);
    return response.data;
  } catch (error) {
    console.error(`Error updating staff ${id}:`, error);
    throw error;
  }
}

export const addStaff = async (staffData: AddStaffProfile): Promise<Account> => {
  try {
    const response = await api.post<Account>(`${endpoint.account}`, staffData);
    return response.data;
  } catch (error) {
    console.error(`Error add staff :`, error);
    throw error;
  }
}

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get<Role[]>(`${endpoint.role}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

/**
 * Upload avatar using presigned URL (same as student/teacher)
 */
export async function uploadAvatar(file: File): Promise<string> {
  try {
    // Get presigned URL for upload (using student endpoint, works for all accounts)
    const res = await api.get(`${endpoint.student}/avatar/upload-url`, {
      params: { fileName: file.name, contentType: file.type },
    });

    const { uploadUrl, publicUrl } = res.data;

    // Upload trực tiếp file lên Cloudflare R2 bằng fetch (không dùng axios instance)
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload avatar: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    // publicUrl là link public ảnh trên cloudflare
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    throw error;
  }
}