import { createClient } from "@/lib/supabase/server";
import { formatSpec } from "@/lib/format";
import { ExcelDownloadButton } from "./excel-download-button";

const dateInputClass =
  "rounded-none border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    in_start?: string;
    in_end?: string;
    out_start?: string;
    out_end?: string;
  }>;
}) {
  const { in_start, in_end, out_start, out_end } = await searchParams;
  const supabase = await createClient();

  let purchaseQuery = supabase
    .from("purchases")
    .select("*, products(product_nm)")
    .order("in_date", { ascending: false });
  if (in_start) purchaseQuery = purchaseQuery.gte("in_date", in_start);
  if (in_end) purchaseQuery = purchaseQuery.lte("in_date", in_end);
  if (!in_start && !in_end) purchaseQuery = purchaseQuery.limit(10);

  let saleQuery = supabase
    .from("sales")
    .select("*, products(product_nm)")
    .order("order_date", { ascending: false });
  if (out_start) saleQuery = saleQuery.gte("order_date", out_start);
  if (out_end) saleQuery = saleQuery.lte("order_date", out_end);
  if (!out_start && !out_end) saleQuery = saleQuery.limit(10);

  const [{ data: purchases }, { data: sales }] = await Promise.all([purchaseQuery, saleQuery]);

  const purchaseRows = purchases ?? [];
  const saleRows = sales ?? [];

  const purchaseTotalQty = purchaseRows.reduce((sum, r) => sum + r.in_qty, 0);
  const purchaseTotalAmount = purchaseRows.reduce((sum, r) => sum + r.in_qty * r.in_prc, 0);
  const saleTotalQty = saleRows.reduce((sum, r) => sum + r.out_qty, 0);
  const saleTotalAmount = saleRows.reduce((sum, r) => sum + r.out_qty * r.out_prc, 0);

  const purchaseExcelData = purchaseRows.map((r) => ({
    매입일자: r.in_date,
    제품: r.products?.product_nm ?? r.product_id,
    규격: formatSpec(r.width_mm, r.height_mm, r.thickness_mm),
    매입개수: r.in_qty,
    매입단가: r.in_prc,
    금액: r.in_qty * r.in_prc,
    비고: r.note ?? "",
  }));

  const saleExcelData = saleRows.map((r) => ({
    주문일자: r.order_date,
    배송일자: r.out_date ?? "",
    현장: r.apartment ?? "",
    제품: r.products?.product_nm ?? r.product_id,
    규격: formatSpec(r.width_mm, r.height_mm, r.thickness_mm),
    매출개수: r.out_qty,
    매출단가: r.out_prc,
    금액: r.out_qty * r.out_prc,
    비고: r.note ?? "",
  }));

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        매입/매출조회
      </h1>

      <section className="border border-slate-300 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-3 py-2">
          <h2 className="text-sm font-bold text-slate-700">
            매입 현황 {!in_start && !in_end && "(최근 10건)"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="out_start" value={out_start ?? ""} />
              <input type="hidden" name="out_end" value={out_end ?? ""} />
              <input type="date" name="in_start" defaultValue={in_start} className={dateInputClass} />
              <span className="text-slate-500">~</span>
              <input type="date" name="in_end" defaultValue={in_end} className={dateInputClass} />
              <button
                type="submit"
                className="rounded-none bg-blue-800 px-3 py-1 text-xs font-medium text-white hover:bg-blue-900"
              >
                조회
              </button>
              {(in_start || in_end) && (
                <a
                  href={`?out_start=${out_start ?? ""}&out_end=${out_end ?? ""}`}
                  className="text-xs text-slate-500 underline"
                >
                  초기화
                </a>
              )}
            </form>
            <ExcelDownloadButton
              data={purchaseExcelData}
              filename={`매입현황_${in_start || "전체"}~${in_end || "전체"}.xlsx`}
              sheetName="매입현황"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">매입일자</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="border-r border-slate-200 p-2">매입개수</th>
                <th className="border-r border-slate-200 p-2">매입단가</th>
                <th className="border-r border-slate-200 p-2">금액</th>
                <th className="p-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRows.map((row) => (
                <tr key={row.in_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.in_date}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="border-r border-slate-200 p-2">{row.in_qty}</td>
                  <td className="border-r border-slate-200 p-2">
                    {Number(row.in_prc).toLocaleString()}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {(row.in_qty * row.in_prc).toLocaleString()}
                  </td>
                  <td className="whitespace-pre-wrap p-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {purchaseRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    매입 내역이 없습니다.
                  </td>
                </tr>
              )}
              {purchaseRows.length > 0 && (
                <tr className="border-t-2 border-slate-400 bg-slate-50 font-bold">
                  <td colSpan={3} className="border-r border-slate-200 p-2 text-right">
                    합계
                  </td>
                  <td className="border-r border-slate-200 p-2">{purchaseTotalQty}</td>
                  <td className="border-r border-slate-200 p-2" />
                  <td className="border-r border-slate-200 p-2">
                    {purchaseTotalAmount.toLocaleString()}
                  </td>
                  <td className="p-2" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-slate-300 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-3 py-2">
          <h2 className="text-sm font-bold text-slate-700">
            매출 현황 {!out_start && !out_end && "(최근 10건)"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="in_start" value={in_start ?? ""} />
              <input type="hidden" name="in_end" value={in_end ?? ""} />
              <input type="date" name="out_start" defaultValue={out_start} className={dateInputClass} />
              <span className="text-slate-500">~</span>
              <input type="date" name="out_end" defaultValue={out_end} className={dateInputClass} />
              <button
                type="submit"
                className="rounded-none bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
              >
                조회
              </button>
              {(out_start || out_end) && (
                <a
                  href={`?in_start=${in_start ?? ""}&in_end=${in_end ?? ""}`}
                  className="text-xs text-slate-500 underline"
                >
                  초기화
                </a>
              )}
            </form>
            <ExcelDownloadButton
              data={saleExcelData}
              filename={`매출현황_${out_start || "전체"}~${out_end || "전체"}.xlsx`}
              sheetName="매출현황"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">주문일자</th>
                <th className="border-r border-slate-200 p-2">배송일자</th>
                <th className="border-r border-slate-200 p-2">현장</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="border-r border-slate-200 p-2">매출개수</th>
                <th className="border-r border-slate-200 p-2">매출단가</th>
                <th className="border-r border-slate-200 p-2">금액</th>
                <th className="p-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {saleRows.map((row) => (
                <tr key={row.out_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.order_date}</td>
                  <td className="border-r border-slate-200 p-2">{row.out_date ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">{row.apartment ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="border-r border-slate-200 p-2">{row.out_qty}</td>
                  <td className="border-r border-slate-200 p-2">
                    {Number(row.out_prc).toLocaleString()}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {(row.out_qty * row.out_prc).toLocaleString()}
                  </td>
                  <td className="whitespace-pre-wrap p-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {saleRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-400">
                    매출 내역이 없습니다.
                  </td>
                </tr>
              )}
              {saleRows.length > 0 && (
                <tr className="border-t-2 border-slate-400 bg-slate-50 font-bold">
                  <td colSpan={5} className="border-r border-slate-200 p-2 text-right">
                    합계
                  </td>
                  <td className="border-r border-slate-200 p-2">{saleTotalQty}</td>
                  <td className="border-r border-slate-200 p-2" />
                  <td className="border-r border-slate-200 p-2">
                    {saleTotalAmount.toLocaleString()}
                  </td>
                  <td className="p-2" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
