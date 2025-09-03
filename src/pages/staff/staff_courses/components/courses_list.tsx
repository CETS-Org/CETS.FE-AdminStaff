import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Pencil, Trash2 , TableIcon, GridIcon,FilePenLine, Eye, Plus} from "lucide-react";
import { Navigate, useNavigate, useNavigation } from "react-router-dom";

type Course = {
  id: number;
  name: string;
  level: string;
  duration: string;
  price: number;
  maxStudents: number;
  currentStudents: number;
  status: "active" | "inactive" | "full";
  description?: string;
  image?: string; // Thêm trường image để chứa đường dẫn hình ảnh
};

export default function CoursesList() {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [isCardList, setIsCardList] = useState<boolean>(false);
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "IELTS Foundation", level: "A1-B1", duration: "6 months", price: 12000000, maxStudents: 20, currentStudents: 15, status: "active", description: "Basic IELTS preparation course", image: "data:image/png;base64,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" },
    { id: 2, name: "TOEIC Advanced", level: "B2-C1", duration: "4 months", price: 10000000, maxStudents: 18, currentStudents: 18, status: "full", description: "Advanced TOEIC preparation", image: "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/blog-2025/meo-vat-doi-song/thumbnail-toeic-la-gi.jpg" },
    { id: 3, name: "Kids English", level: "Beginner", duration: "12 months", price: 8000000, maxStudents: 15, currentStudents: 12, status: "active", description: "English for children 6-12 years", image: "https://via.placeholder.com/300x150?text=Kids" },
    { id: 4, name: "Business English", level: "B1-C1", duration: "3 months", price: 15000000, maxStudents: 12, currentStudents: 8, status: "active", description: "Professional business communication", image: "https://via.placeholder.com/300x150?text=Business" },
    { id: 5, name: "Conversation Club", level: "All levels", duration: "Ongoing", price: 2000000, maxStudents: 25, currentStudents: 20, status: "active", description: "Weekly conversation practice", image: "https://via.placeholder.com/300x150?text=Conversation" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const currentData = useMemo(
    () => courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [courses, currentPage]
  );

  const columns: TableColumn<Course>[] = [
    { header: "Course Name", accessor: (row) => row.name },
    { header: "Level", accessor: (row) => row.level },
    { header: "Duration", accessor: (row) => row.duration },
    { header: "Price (VND)", accessor: (row) => row.price.toLocaleString() },
    { header: "Students", accessor: (row) => `${row.currentStudents}/${row.maxStudents}` },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.status === 'full' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
            <button
           className="flex items-center justify-center w-6 h-6 rounded-full border text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
           onClick={() => handleView()}
         >
           <Eye className="w-4 h-4" />
         </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    navigate("/courses/add");
  };

  const handleEdit = (course: Course) => {
    navigate(`/courses/edit/${course.id}`);
  };

  const handleDelete = (course: Course) => {
    setDeleteDialog({ open: true, course });
  };


  const handleView =()=>{
    navigate("/courseDetail")
  }

  const confirmDelete = () => {
    if (deleteDialog.course) {
      setCourses(prev => prev.filter(c => c.id !== deleteDialog.course!.id));
      setDeleteDialog({ open: false, course: null });
    }
  };

  // Component Card cho mỗi khóa học
  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <img src={course.image || "https://via.placeholder.com/300x150"} alt={course.name} className="w-full h-36 object-cover border-b-2" />
      <div className="p-4 text-[80%]">
        <h3 className="text-lg font-semibold">{course.name}</h3>
        <p className="text-gray-600">Level: {course.level}</p>
        <p className="text-gray-600">Duration: {course.duration}</p>
        <p className="text-gray-600">Price: {course.price.toLocaleString()} VND</p>
        <p className="text-gray-600">Students: {course.currentStudents}/{course.maxStudents}</p>
        <div className=" flex flex-row justify-between h-full">
        <span className={`inline-flex px-2 pb-0.5 rounded-md text-[75%] border items-center h-[50%]
          ${course.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${course.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${course.status === 'full' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {course.status}
        </span>
        <div className="flex gap-2 mt-2 h-[80%]">
        <button
           className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
           onClick={() => handleView()}
         >
           <Eye className="w-4 h-4" />
         </button>
         <button
           className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
           onClick={() => handleEdit(course)}
         >
           <FilePenLine className="w-4 h-4" />
         </button>
         <button
           className="flex items-center justify-center w-8 h-8 rounded-full border border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
           onClick={() => handleDelete(course)}
         >
           <Trash2 className="w-4 h-4" />
         </button>
       </div>
        </div>
        
       
      </div>
    </div>
  );

  return (
    <div>
  

      <Card title="Courses List">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <p className="mr-2">View: </p>
            <div className="flex bg-gray-200 rounded-md w-fit h-[30px] border">
              <button className={`flex items-center gap-2 px-1 rounded-md ${isCardList ? "" : "bg-primary-800 text-white"}`} onClick={() => setIsCardList(!isCardList)}>      
                <TableIcon className="w-3 h-3" />
                Table
              </button>
              <button className={`flex items-center gap-2 px-1 rounded-md ${isCardList ? "bg-primary-800 text-white" : ""}`} onClick={() => setIsCardList(!isCardList)}>
                <GridIcon className="w-3 h-3" />
                Card
              </button>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>
       
        {isCardList ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={currentData} />
        )}
      </Card>

 
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    



      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, course: null })}
        onConfirm={confirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteDialog.course?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}