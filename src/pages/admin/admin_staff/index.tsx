import StaffList from "./components/staff_list";

export default function AdminStaffPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-0 pt-11">
      <div className="p-6 space-y-8">
        <StaffList />
      </div>
    </div>
  );
}
