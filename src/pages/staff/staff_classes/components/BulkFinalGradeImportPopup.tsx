// src/pages/staff/staff_classes/components/BulkFinalGradeImportPopup.tsx

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import Button from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

export interface FinalGradeImportData {
  enrollmentId: string;
  studentCode: string;
  studentName: string;
  finalGrade: number | null;
}

interface BulkFinalGradeImportPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (gradesData: FinalGradeImportData[]) => Promise<void>;
  className: string;
  students: Array<{
    enrollmentId: string;
    studentCode: string;
    studentName: string;
  }>;
}

interface ParsedRow {
  studentCode: string;
  studentName: string;
  finalGrade: number | null;
  isValid: boolean;
  error?: string;
}

export default function BulkFinalGradeImportPopup({
  open,
  onOpenChange,
  onSubmit,
  className,
  students,
}: BulkFinalGradeImportPopupProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download Excel template
  const handleDownloadTemplate = () => {
    const templateData = students.map((student) => ({
      'Student Code': student.studentCode,
      'Student Name': student.studentName,
      'Final Grade': '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Student Code
      { wch: 30 }, // Student Name
      { wch: 12 }, // Final Grade
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Final Grades');

    // Generate Excel file
    XLSX.writeFile(workbook, `${className}_Final_Grade_Template.xlsx`);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setParsedData([]);
      setUploadSuccess(false);
      parseExcelFile(selectedFile);
    }
  };

  // Parse Excel file
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Validate headers
        if (jsonData.length < 2) {
          setError('File must contain at least a header row and one data row');
          return;
        }

        const headers = jsonData[0];
        const studentCodeIndex = headers.findIndex((h: string) => 
          h?.toString().toLowerCase().includes('student code') || h?.toString().toLowerCase().includes('studentcode')
        );
        const studentNameIndex = headers.findIndex((h: string) => 
          h?.toString().toLowerCase().includes('student name') || h?.toString().toLowerCase().includes('studentname')
        );
        const finalGradeIndex = headers.findIndex((h: string) => 
          h?.toString().toLowerCase().includes('final grade') || 
          h?.toString().toLowerCase().includes('finalgrade') ||
          h?.toString().toLowerCase().includes('grade')
        );

        if (studentCodeIndex === -1 || studentNameIndex === -1) {
          setError('Invalid file format. Required columns: Student Code, Student Name. Optional: Final Grade');
          return;
        }

        // Parse data rows
        const parsed: ParsedRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const studentCode = row[studentCodeIndex]?.toString().trim();
          const studentName = row[studentNameIndex]?.toString().trim();
          const finalGradeValue = finalGradeIndex !== -1 ? row[finalGradeIndex] : null;

          if (!studentCode || !studentName) {
            // Skip empty rows
            continue;
          }

          // Check if final grade is provided
          const hasFinalGrade = finalGradeValue !== undefined && finalGradeValue !== null && finalGradeValue !== '';

          if (!hasFinalGrade) {
            // Skip rows with no grade data to update
            continue;
          }

          let finalGrade: number | null = null;
          let isValid = true;
          let error: string | undefined;

          // Parse and validate final grade if provided
          if (hasFinalGrade) {
            finalGrade = parseFloat(finalGradeValue.toString());
            if (isNaN(finalGrade) || finalGrade < 0 || finalGrade > 100) {
              isValid = false;
              error = 'Final grade must be between 0 and 100';
            }
          }

          // Validate student exists
          const studentExists = students.some(
            (s) => s.studentCode.toLowerCase() === studentCode.toLowerCase()
          );
          if (!studentExists) {
            isValid = false;
            error = 'Student not found in class';
          }

          parsed.push({
            studentCode,
            studentName,
            finalGrade,
            isValid,
            error,
          });
        }

        setParsedData(parsed);
        setUploadSuccess(true);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setError('Failed to parse Excel file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsBinaryString(file);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (parsedData.length === 0) {
      setError('No data to import');
      return;
    }

    const validData = parsedData.filter((row) => row.isValid);
    if (validData.length === 0) {
      setError('No valid data to import. Please fix errors and try again.');
      return;
    }

    const gradesData: FinalGradeImportData[] = validData.map((row) => {
      const student = students.find(
        (s) => s.studentCode.toLowerCase() === row.studentCode.toLowerCase()
      );
      return {
        enrollmentId: student!.enrollmentId,
        studentCode: row.studentCode,
        studentName: row.studentName,
        finalGrade: row.finalGrade,
      };
    });

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(gradesData);
      // Reset state on success
      setFile(null);
      setParsedData([]);
      setUploadSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error submitting final grades:', err);
      setError(err.message || 'Failed to import final grades. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const validCount = parsedData.filter((row) => row.isValid).length;
  const invalidCount = parsedData.filter((row) => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-accent-200">
          <div>
            <h2 className="text-2xl font-bold text-primary-800">Import Final Grades from Excel</h2>
            <p className="text-sm text-neutral-600 mt-1">{className}</p>
          </div>
        </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Instructions */}
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <FileSpreadsheet size={18} />
                Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-700">
                <li>Download the template Excel file</li>
                <li>Fill in the final grades (0-100) for each student</li>
                <li>Leave cells empty if you don't want to update that student's grade</li>
                <li>Upload the completed file</li>
                <li>Review the data and submit</li>
              </ol>
            </div>

            {/* Download Template Button */}
            <div className="mb-6">
              <Button
                variant="secondary"
                onClick={handleDownloadTemplate}
                iconLeft={<Download size={16} />}
                className="w-full sm:w-auto"
              >
                Download Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upload Excel File
              </label>
              <div className="border-2 border-dashed border-accent-300 rounded-lg p-6 text-center hover:border-accent-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-accent-400 mb-2" />
                  <span className="text-neutral-700 font-medium">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-neutral-500 text-sm mt-1">
                    Excel files only (.xlsx, .xls)
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && parsedData.length > 0 && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-success-700 text-sm font-medium">
                      File uploaded successfully!
                    </p>
                    <p className="text-success-600 text-sm mt-1">
                      {validCount} valid record(s), {invalidCount} invalid record(s)
                    </p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-white border border-neutral-200 rounded-lg">
                    <thead className="bg-accent-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-primary-800">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-primary-800">
                          Student Code
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-primary-800">
                          Student Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-primary-800">
                          Final Grade
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-primary-800">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {parsedData.map((row, index) => (
                        <tr
                          key={index}
                          className={row.isValid ? '' : 'bg-error-50'}
                        >
                          <td className="px-4 py-2 text-sm text-neutral-700">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 text-sm text-neutral-700">
                            {row.studentCode}
                          </td>
                          <td className="px-4 py-2 text-sm text-neutral-700">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-2 text-sm text-neutral-700">
                            {row.finalGrade !== null ? row.finalGrade : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-success-700">
                                <CheckCircle size={14} />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-error-700">
                                <AlertCircle size={14} />
                                {row.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="border-t border-accent-200 p-6 flex justify-end gap-3 bg-accent-25/30">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || parsedData.length === 0 || validCount === 0}
            >
              {isLoading ? 'Importing...' : `Import ${validCount} Record(s)`}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

