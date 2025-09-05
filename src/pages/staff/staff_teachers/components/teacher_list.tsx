import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import DeleteConfirmDialog from "./delete_confirm_dialog";
import { Search, Filter, X, Eye, Edit, Trash2, Plus } from "lucide-react";

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
  field: string;
}

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  specialization: string;
  experience: string;
  status: "active" | "inactive";
  avatar?: string;
  qualifications: Qualification[];
};

export default function TeacherList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null }>({ open: false, teacher: null });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const [teachers, setTeachers] = useState<Teacher[]>([
    { 
      id: "1", 
      name: "John Doe", 
      email: "john.doe@email.com", 
      phone: "0898123455", 
      dateOfBirth: "1985-03-15",
      hireDate: "2023-01-15",
      specialization: "IELTS", 
      experience: "5 years", 
      status: "active",
      qualifications: [
        { id: "1", degree: "M.A.", institution: "University of Cambridge", year: "2010", field: "English Literature" }
      ]
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      email: "jane.smith@email.com", 
      phone: "0898123456", 
      dateOfBirth: "1988-07-22",
      hireDate: "2023-03-20",
      specialization: "TOEIC", 
      experience: "3 years", 
      status: "active",
      qualifications: [
        { id: "2", degree: "B.A.", institution: "University of Oxford", year: "2012", field: "Linguistics" }
      ]
    },
    { 
      id: "3", 
      name: "Alice Johnson", 
      email: "alice.johnson@email.com", 
      phone: "0898123457", 
      dateOfBirth: "1990-11-08",
      hireDate: "2022-11-10",
      specialization: "Kids English", 
      experience: "4 years", 
      status: "inactive",
      qualifications: [
        { id: "3", degree: "M.A.", institution: "University of London", year: "2011", field: "Education" }
      ]
    },
    { 
      id: "4", 
      name: "Bob Brown", 
      email: "bob.brown@email.com", 
      phone: "0898123458", 
      dateOfBirth: "1982-05-12",
      hireDate: "2022-08-05",
      specialization: "Business English", 
      experience: "6 years", 
      status: "active",
      qualifications: [
        { id: "4", degree: "Ph.D.", institution: "University of Manchester", year: "2015", field: "Business Communication" }
      ]
    },
    { 
      id: "5", 
      name: "Chris Evans", 
      email: "chris.evans@email.com", 
      phone: "0898123459", 
      dateOfBirth: "1992-09-30",
      hireDate: "2023-06-12",
      specialization: "Conversation", 
      experience: "2 years", 
      status: "inactive",
      qualifications: [
        { id: "5", degree: "B.A.", institution: "University of Edinburgh", year: "2018", field: "English Language" }
      ]
    },
    { 
      id: "6", 
      name: "Emma Watson", 
      email: "emma.watson@email.com", 
      phone: "0898123460", 
      dateOfBirth: "1987-12-03",
      hireDate: "2022-05-18",
      specialization: "IELTS", 
      experience: "7 years", 
      status: "active",
      qualifications: [
        { id: "6", degree: "M.A.", institution: "University of Cambridge", year: "2009", field: "Applied Linguistics" }
      ]
    },
    { 
      id: "7", 
      name: "Michael Wilson", 
      email: "michael.wilson@email.com", 
      phone: "0898123461", 
      dateOfBirth: "1986-01-25",
      hireDate: "2023-02-28",
      specialization: "TOEIC", 
      experience: "4 years", 
      status: "active",
      qualifications: [
        { id: "7", degree: "B.A.", institution: "University of Birmingham", year: "2013", field: "English Literature" }
      ]
    },
    { 
      id: "8", 
      name: "Sarah Davis", 
      email: "sarah.davis@email.com", 
      phone: "0898123462", 
      dateOfBirth: "1989-04-18",
      hireDate: "2023-04-15",
      specialization: "Kids English", 
      experience: "3 years", 
      status: "active",
      qualifications: [
        { id: "8", degree: "M.A.", institution: "University of Leeds", year: "2014", field: "Child Education" }
      ]
    },
  ]);

  // Filter and search logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = searchTerm === "" || 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.includes(searchTerm) ||
        teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
      const matchesSpecialization = specializationFilter === "all" || teacher.specialization === specializationFilter;
      const matchesExperience = experienceFilter === "all" || teacher.experience === experienceFilter;
      
      return matchesSearch && matchesStatus && matchesSpecialization && matchesExperience;
    });
  }, [teachers, searchTerm, statusFilter, specializationFilter, experienceFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const currentData = useMemo(
    () => filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredTeachers, currentPage]
  );

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, specializationFilter, experienceFilter]);

  const columns: TableColumn<Teacher>[] = [
    { 
      header: "Teacher", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: "Phone", accessor: (row) => row.phone },
    { header: "Specialization", accessor: (row) => row.specialization },
    { header: "Experience", accessor: (row) => row.experience },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    { header: "Hire Date", accessor: (row) => new Date(row.hireDate).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleView(row)}
            className="inline-flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">View</span>
            </div>
            
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(row)}
            className="inline-flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">Edit</span>
            </div>
            
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(row)}
            className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">Delete</span>
            </div>
           
          </Button>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    navigate("/teachers/add");
  };

  const handleEdit = (teacher: Teacher) => {
    navigate(`/teachers/edit/${teacher.id}`);
  };

  const handleView = (teacher: Teacher) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const handleDelete = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher });
  };


  const confirmDelete = () => {
    if (deleteDialog.teacher) {
      setTeachers(prev => prev.filter(t => t.id !== deleteDialog.teacher!.id));
      setDeleteDialog({ open: false, teacher: null });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSpecializationFilter("all");
    setExperienceFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || specializationFilter !== "all" || experienceFilter !== "all";

  // Get unique specializations and experiences for filter options
  const specializations = useMemo(() => {
    const uniqueSpecializations = [...new Set(teachers.map(t => t.specialization))];
    return uniqueSpecializations.sort();
  }, [teachers]);

  const experiences = useMemo(() => {
    const uniqueExperiences = [...new Set(teachers.map(t => t.experience))];
    return uniqueExperiences.sort((a, b) => {
      const aYears = parseInt(a.split(' ')[0]);
      const bYears = parseInt(b.split(' ')[0]);
      return aYears - bYears;
    });
  }, [teachers]);

  return (
    <div>
      <Card 
        title="Teacher List" 
        description="View and manage all teachers"
        actions={
          <Button onClick={handleAdd} size="sm" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Teacher
          </Button>
        }
      >
        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search teachers by name, email, phone, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="flex items-center gap-2 text-primary-500"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {hasActiveFilters && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[searchTerm, statusFilter, specializationFilter, experienceFilter].filter(f => f !== "" && f !== "all").length}
                  </span>
                )}
              </span>
            </Button>
            <Button
              onClick={clearFilters}
              variant="secondary"
              className="whitespace-nowrap text-red-500"
            >
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
              <Select
                label="Specialization"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                options={[
                  { label: "All Specializations", value: "all" },
                  ...specializations.map(spec => ({ label: spec, value: spec }))
                ]}
              />
              <Select
                label="Experience"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                options={[
                  { label: "All Experience Levels", value: "all" },
                  ...experiences.map(exp => ({ label: exp, value: exp }))
                ]}
              />
            </div>
          )}
        </div>

        {/* Table */}
        <Table 
          columns={columns} 
          data={currentData}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters ? "No teachers match your filters" : "No teachers found"}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clear the filters."
                  : "Get started by adding your first teacher."
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="secondary">
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={handleAdd} className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Teacher
                </Button>
              )}
            </div>
          }
        />
      </Card>      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredTeachers.length}
        startIndex={(currentPage - 1) * itemsPerPage}
        endIndex={Math.min(currentPage * itemsPerPage, filteredTeachers.length)}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, teacher: null })}
        onConfirm={confirmDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete "${deleteDialog.teacher?.name}"? This action cannot be undone.`}
      />
      
    </div>
  );
}