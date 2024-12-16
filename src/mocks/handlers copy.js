// src/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/billcard", () => {
    return HttpResponse.json([
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: "NUT PROJECT.\"\"D\"\"M.10X1.24",
        M_SUBINV: "RP-B-MAT",
        M_DATE: "11/20/24 14:06",
        M_QTY: "-8",
        M_QTY_RM: "999",
        M_ID: "372818",
        M_SOURCE_ID: "12523",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        // ใช้ placeholder image แทนในระหว่างที่ทำ development
        M_PART_IMG: "https://placehold.co/400x400/orange/white",
        inventory: [
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 15:15:30",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 76,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "PPDF-024",
            signature: "Nattanon"
          }
        ]
      }
    ]);
  }),

  // Handler สำหรับจัดการ request รูปภาพ
  http.get("/img/*", ({ request }) => {
    // ส่ง placeholder image กลับไปแทน
    return HttpResponse.json({
      url: "https://placehold.co/400x400/orange/white"
    });
  })
];