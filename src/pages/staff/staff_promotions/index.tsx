import PromotionManagement from "./components/PromotionManagement";

export default function StaffPromotionsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-0 pt-11">
      <div className="p-6 space-y-8">
        <PromotionManagement />
      </div>
    </div>
  );
}
