import Button from "@/components/ui/Button";
import { Download, Printer, Share2, FileText } from "lucide-react";

interface QuickActionsBarProps {
  onExport: () => void;
  onPrint: () => void;
  onShare: () => void;
  onGenerateReport: () => void;
}

export default function QuickActionsBar({
  onExport,
  onPrint,
  onShare,
  onGenerateReport,
}: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <Button variant="outline" size="sm" onClick={onExport} iconLeft={<Download className="w-4 h-4" />}>
        Export Schedule
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint} iconLeft={<Printer className="w-4 h-4" />}>
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={onShare} iconLeft={<Share2 className="w-4 h-4" />}>
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={onGenerateReport} iconLeft={<FileText className="w-4 h-4" />}>
        Generate Report
      </Button>
    </div>
  );
}

