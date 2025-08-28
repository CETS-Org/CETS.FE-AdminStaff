import Pagination from "@/shared/pagination";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";

export default function TeacherList() {

     const teachers = [
    { id: 1, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "John Doe", phoneNumber: "0898123455", status: "active" },
    { id: 2, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Jane Smith", phoneNumber: "0898123455", status: "pending" },
    { id: 3, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Alice Johnson", phoneNumber: "0898123455", status: "ban" },
    { id: 4, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Bob Brown", phoneNumber: "0898123455", status: "active" },
    { id: 5, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Chris Evans", phoneNumber: "0898123455", status: "pending" },
    { id: 6, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Emma Watson", phoneNumber: "0898123455", status: "active" },
     { id: 7, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "John Doe", phoneNumber: "0898123455", status: "active" },
    { id: 8, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Jane Smith", phoneNumber: "0898123455", status: "pending" },
    { id: 9, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Alice Johnson", phoneNumber: "0898123455", status: "ban" },
    { id: 10, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Bob Brown", phoneNumber: "0898123455", status: "active" },
    { id:11, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Chris Evans", phoneNumber: "0898123455", status: "pending" },
    { id: 12, avatar: "https://bayotech.vn/wp-content/uploads/2025/05/avatar-mac-dinh-ngau-5.jpg", name: "Emma Watson", phoneNumber: "0898123455", status: "active" },
  ];  
  
  const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const totalPages = Math.ceil(teachers.length / itemsPerPage);
    const currentTeachers  = teachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <h1 className="text-xl font-bold mb-4 text-gray-500">Teacher List</h1>
            <table className="min-w-full rounded-lg shadow-sm border border-gray-200 bg-white ">
                <thead className="bg-primary-800 ">
                    <tr>
                        <th className="py-2 px-4 border-b border-gray-200 text-sm text-gray-300 text-left">Teacher</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-sm text-gray-300 text-left">Information</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-sm text-gray-300 text-left">Status</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-sm text-gray-300 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className=" ">
                    {currentTeachers.map((teacher) => (
                        <tr key={teacher.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100" >
                            <td className="py-2 px-4 border-b border-gray-200"><img src={teacher.avatar} className="rounded-full h-10 w-10"></img></td>
                            <td className="py-2 px-4 border-b border-gray-200 flex flex-col">
                                <div className="">{teacher.name}</div>
                                <div className="text-[75%] text-gray-400">{teacher.phoneNumber}</div>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200">
                                <p
                                    className={`w-[30%] flex justify-center border rounded-xl px-2 py-0.5 text-[75%]
                                        ${teacher.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-300 text-center" : ""}
                                        ${teacher.status === "ban" ? "bg-red-100 text-red-700 border-red-300" : ""}
                                        ${teacher.status === "active" ? "bg-green-100 text-green-700 border-green-300" : ""}`
                                    }
                                >{teacher.status}</p>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 ">
                                <button className="mx-1 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                                    <Eye size={16} />
                                </button>
                                <button className="mx-1 p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                                    <Pencil size={16} />
                                </button>
                                <button className="mx-1 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                                    <Trash2 size={16} />
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

     
                <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        
      />
             
        </div>
    )
}