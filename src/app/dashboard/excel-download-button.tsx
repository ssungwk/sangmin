"use client";

export function ExcelDownloadButton({
  data,
  filename,
  sheetName = "Sheet1",
}: {
  data: Record<string, string | number>[];
  filename: string;
  sheetName?: string;
}) {
  async function handleDownload() {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={data.length === 0}
      className="rounded-none border border-slate-400 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      엑셀 다운로드
    </button>
  );
}
