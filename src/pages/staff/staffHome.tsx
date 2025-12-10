// src/pages/staff/StaffHome.tsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GenericNavbar from "@/shared/GenericNavbar";
import { createAcademicStaffNavbarConfig, createAccountantStaffNavbarConfig } from "@/shared/navbarConfigs";
import { academicStaffSidebarConfig, accountantStaffSidebarConfig } from "@/shared/sidebarConfigs";
import StaffSidebar from "@/shared/StaffSidebar";

import StaffSchedulePage from "./staff_schedule/components/StaffSchedulePage";
import StaffStudentsPage from "./staff_students";
import TeacherManagement from "./staff_teachers";
import StaffAnalytics from "./staff_analys";
import AddEditClassPage from "./staff_classes/AddEditClassPage";
import ClassDetailPage from "./staff_classes/ClassDetailPage";
import AssignTeacherPage from "./staff_assign_teacher";
import StaffRequestPage from "./staff_request";
import StaffEventsPage from "./staff_events";
import EventDetailPage from "./staff_events/EventDetailPage";
import StaffComplaintManagement from "./staff_complaints";
import StudentDetailPage from "./staff_students/StudentDetailPage";
import TeacherDetailPage from "./staff_teachers/TeacherDetailPage";
import AddEditTeacherPage from "./staff_teachers/AddTeacherPage";
import EditTeacherPage from "./staff_teachers/EditTeacherPage";
import ComplaintDetailPage from "@/shared/ComplaintDetailPage";
import ComplaintResponsePage from "@/shared/ComplaintResponsePage";
import EditStudentPage from "./staff_students/EditStudentPage";
import AddStudentPage from "./staff_students/AddStudentPage";
import StaffPromotionsPage from "./staff_promotions";
import StaffTimetablePage from "./staff_timetable";
import StaffClassesPage from "./staff_classes";
import StaffRoomsPage from "./staff_rooms";
import StaffContractsPage from "./staff_contracts";
import StaffTransactionsPage from "./staff_transactions";
import PlacementTestManagementPage from "./staff_placement_test";
import PlacementQuestionManagementPage from "./staff_placement_test/PlacementQuestionManagementPage";
import CreatePlacementTestPage from "./staff_placement_test/CreatePlacementTestPage";
import StaffPlacementTestTaking from "./staff_placement_test/StaffPlacementTestTaking";
import StaffProfilePage from "./StaffProfilePage";

export default function StaffHome() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); 
  const [userAccount, setUserAccount] = useState(null);
  const [userRole, setUserRole] = useState<string>('');
  const location = useLocation();

  const contentShiftClass = collapsed ? "lg:ml-16" : "lg:ml-64";

  // Load user account data and determine role
  useEffect(() => {
    const userData = localStorage.getItem('userInfo'); 
    if (userData) {
      const account = JSON.parse(userData);
      setUserAccount(account);
      // Get the first role from roleNames array
      if (account.roleNames && account.roleNames.length > 0) {
        setUserRole(account.roleNames[0]);
      } else {
        console.warn('StaffHome - No roleNames found in user account:', account);
      }
    } else {
      console.warn('StaffHome - No user data found in localStorage');
    }
  }, []);

  // Determine which navbar config to use based on role
  const getNavbarConfig = () => {
    if (userRole === 'AcademicStaff') {
      return createAcademicStaffNavbarConfig(userAccount);
    } else if (userRole === 'AccountantStaff') {
      return createAccountantStaffNavbarConfig(userAccount);
    }
    // Default to academic staff if role is unclear
    return createAcademicStaffNavbarConfig(userAccount);
  };

  // Determine which sidebar config to use based on role
  const getSidebarConfig = () => {
    if (userRole === 'AcademicStaff') {
      return academicStaffSidebarConfig;
    } else if (userRole === 'AccountantStaff') {
      return accountantStaffSidebarConfig;
    }
    // Default to academic staff if role is unclear
    return academicStaffSidebarConfig;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <GenericNavbar 
        config={getNavbarConfig()} 
        collapsed={collapsed}
        mobileOpen={mobileOpen}
      />

      <StaffSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v: boolean) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
        config={getSidebarConfig()}
      />

      <div
        className={[
          "transition-all duration-300",
          contentShiftClass,
          mobileOpen ? "hidden lg:block" : "",
        ].join(" ")}
      >
        {/* Main content area with proper padding */}
        <div className="px-6 lg:px-8">
          <Routes>
            <Route path="analytics" element={<StaffAnalytics />} />
            {/* <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teachers/add" element={<AddEditTeacherPage />} />
            <Route path="teachers/:id" element={<TeacherDetailPage />} />
            <Route path="teachers/edit/:id" element={<EditTeacherPage />} />         
            <Route path="students" element={<StaffStudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students/edit/:id" element={<EditStudentPage />} />
            <Route path="students/add" element={<AddStudentPage />} /> */}            
            <Route path="schedule" element={<StaffSchedulePage />} />
            <Route path="timetable" element={<StaffTimetablePage />} />
            <Route path="rooms" element={<StaffRoomsPage />} />
            <Route
              path="contracts"
              element={userRole === 'AccountantStaff' ? <StaffContractsPage /> : <Navigate to="/staff/analytics" replace />}
            />
            <Route
              path="transactions"
              element={userRole === 'AccountantStaff' ? <StaffTransactionsPage /> : <Navigate to="/staff/analytics" replace />}
            />
            <Route path="classes" element={<StaffClassesPage />} />
            <Route path="classes/add" element={<AddEditClassPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="classes/:id/edit" element={<AddEditClassPage />} />
            <Route path="assign-teacher" element={<AssignTeacherPage />} />
            <Route path="promotions" element={<StaffPromotionsPage />} />
            <Route path="events" element={<StaffEventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="complaints" element={<StaffComplaintManagement />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="complaints/:id/response" element={<ComplaintResponsePage />} />
            <Route path="placement-test" element={<PlacementTestManagementPage />} />
            <Route path="placement-test/questions" element={<PlacementQuestionManagementPage />} />
            <Route path="placement-test/create" element={<CreatePlacementTestPage />} />
            <Route path="placement-test/edit/:id" element={<CreatePlacementTestPage />} />
            <Route path="placement-test/try/:testId" element={<StaffPlacementTestTaking />} />
            <Route path="requests" element={<StaffRequestPage />} />
            <Route path="profile" element={<StaffProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
