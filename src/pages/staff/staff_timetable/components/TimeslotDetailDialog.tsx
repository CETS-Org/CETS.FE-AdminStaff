import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/Dialog";
import type { Timeslot } from '@/types/timetable.type';
import { Clock, Hash, Timer, FileText, Activity, Calendar, Edit2 } from 'lucide-react';
import { formatDate } from "@/helper/helper.service";

interface TimeslotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeslot: Timeslot | null;
}

export default function TimeslotDetailDialog({
  open,
  onOpenChange,
  timeslot,
}: TimeslotDetailDialogProps) {
  if (!timeslot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] mt-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Timeslot Details
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 pb-4">
          {/* Timeslot Header */}
          <div className="text-center pb-4 border-b">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">{timeslot.slotNumber}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{timeslot.slotName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {timeslot.startTime} - {timeslot.endTime}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                timeslot.isActive 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  timeslot.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                {timeslot.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Timeslot Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Slot Number</label>
                <p className="text-sm font-medium text-gray-900">{timeslot.slotNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Slot Name</label>
                <p className="text-sm font-medium text-gray-900 truncate">{timeslot.slotName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <p className="text-sm font-medium text-gray-900">{timeslot.startTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                <p className="text-sm font-medium text-gray-900">{timeslot.endTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Timer className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <p className="text-sm font-medium text-gray-900">{timeslot.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <p className="text-sm font-medium text-gray-900">{timeslot.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm font-medium text-gray-900 truncate">{formatDate(timeslot.createdAt ?? null)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Edit2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {timeslot.updatedAt ? formatDate(timeslot.updatedAt ?? null) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {timeslot.description ? (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Description
              </label>
              <p className="text-sm text-gray-700 leading-relaxed">
                {timeslot.description}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                No description provided
              </p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

