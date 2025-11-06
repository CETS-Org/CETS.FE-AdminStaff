import Card from "@/components/ui/Card";

export type OverViewCourseProps = {
    title: string;
    value: number;
    description: string;
    percentage: number;
};

const overviewCourse: OverViewCourseProps[] = [
    { title: "Total Students", value: 1000000, description: "Total Students", percentage: 12 },
    { title: "Total Courses", value: 1000, description: "Total Courses", percentage: 2 },
    { title: "Total Teachers", value: 1000000, description: "Total Teachers", percentage: 1 },
    { title: "Completion Rate", value: 88.9, description: "Completion Rate", percentage: 3 },
];
const bgColors: Record<string, string> = {
    Students: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    Courses: "bg-gradient-to-r from-green-500 to-green-600 text-white",
    Teachers: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    "Completion Rate": "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
  };

export default function OverViewCourse() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2 ">
        {overviewCourse.map((item, index) => (
            <Card  key={index}
            className={
                Object.entries(bgColors).find(([k]) => item.title.includes(k))?.[1] || "bg-gray-200"
                } >
            <div className="text-center">
              <div className="text-3xl font-bold">{item.value}</div>
              <div className="text-blue-100">{item.title}</div>
              <div className="text-sm text-blue-200 mt-1">+12% from last month</div>
            </div>
          </Card>
        ))}
                   
        </div>
  );
}