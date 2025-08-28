export default function AddSearchTeacher() {

    return (
    <div className="min-w-full rounded-lg shadow-sm border border-gray-200 bg-white p-2 flex justify-between items-center mb-4">
        <button className="bg-gray-500 rounded-md px-2 py-1 text-gray-200 hover:bg-primary-900"> Add new teacher</button>
        <div className="flex gap-2">
            <input className="px-2 py-1 border border-slate-200 rounded-md" type="text" placeholder="Search teacher"/>
        <select className=" px-2 py-1 border border-slate-200 rounded-md">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="ban">Ban</option>
        </select>
        <select className=" px-2 py-1 border border-slate-200 rounded-md">
            <option value="all course">all course</option>
            <option value="ielts">Ielts</option>
            <option value="toeic">Toeic</option>
        </select>
        </div>
        
    </div>
)
}