export function downloadAttendanceCSV(attendance: any[], session: any) {
  const csvContent = [
    // Header row
    ['Name', 'Email', 'Student ID', 'Timestamp'].join(','),
    // Data rows
    ...attendance.map(record => [
      `"${record.name}"`,
      `"${record.email}"`,
      `"${record.studentId}"`,
      `"${new Date(record.timestamp).toLocaleString()}"`,
    ].join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${session.course}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}