// src/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/billcard", () => {
    return HttpResponse.json([
      {
        M_PART_NUMBER: "",
        M_PART_DESCRIPTION: "",
        M_SUBINV: "",
        M_DATE: "",
        M_QTY: "",
        M_ID: "",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "",
        TRANSACTION_TYPE_NAME: "",
        M_PART_IMG: "",
        inventory: [{}],
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.24',
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
        M_PART_IMG: "/img/Product/product_img1.png",
        inventory: [
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 15:15:30",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 76,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "PPDF-024",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 52,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "PPDF-237",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 28,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "207A08",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 4,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A03F068",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
        ],
      },
      {
        M_PART_NUMBER: "9091140701",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "11/20/24 17:06",
        M_QTY: "3000",
        M_QTY_RM: "999",
        M_ID: "3237012",
        M_SOURCE_ID: "290004",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "18",
        TRANSACTION_TYPE_NAME: "PO Receipt",
        M_PART_IMG: "/img/Product/product_img1.png",
        inventory: [
          {
            id: "20Y5311G24",
            date_time: "2024-11-28 15:15:30",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 76,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "PPDF-024",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 52,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "PPDF-237",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 28,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "207A08",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:32:12",
            quantity_received: 24,
            quantity_sold: 24,
            quantity_remaining: 4,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A03F068",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
          {
            id: "20Y5311G24",
            date_time: "2024-10-28 11:29:56",
            quantity_received: 4,
            quantity_sold: 4,
            quantity_remaining: 0,
            job: "NOT PROJECT'D'M.10X1.25",
            plan_id: "2A04F097",
            signature: "Nattanon",
          },
        ],
      },
      {
        M_PART_NUMBER: "9091140702",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "11/19/24 9:52",
        M_QTY: "-8",
        M_QTY_RM: "999",
        M_ID: "53098825",
        M_SOURCE_ID: "7561289",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140703",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "9/3/20 9:40",
        M_QTY: "-12",
        M_QTY_RM: "999",
        M_ID: "69195269",
        M_SOURCE_ID: "8533927",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "8/4/21 14:10",
        M_QTY: "1500",
        M_QTY_RM: "999",
        M_ID: "141166545",
        M_SOURCE_ID: "13023019",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "18",
        TRANSACTION_TYPE_NAME: "PO Receipt",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "3/15/22 15:29",
        M_QTY: "-24",
        M_QTY_RM: "999",
        M_ID: "183266198",
        M_SOURCE_ID: "13655152",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "9/14/23 16:32",
        M_QTY: "-24",
        M_QTY_RM: "999",
        M_ID: "306388963",
        M_SOURCE_ID: "20755512",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "4/19/24 9:26",
        M_QTY: "-48",
        M_QTY_RM: "999",
        M_ID: "348420912",
        M_SOURCE_ID: "24335502",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/10/19 10:47",
        M_QTY: "-22",
        M_QTY_RM: "999",
        M_ID: "725670",
        M_SOURCE_ID: "9534",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "9/4/19 11:21",
        M_QTY: "-24",
        M_QTY_RM: "999",
        M_ID: "13347744",
        M_SOURCE_ID: "2391795",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "10/1/19 17:01",
        M_QTY: "1500",
        M_QTY_RM: "999",
        M_ID: "17676369",
        M_SOURCE_ID: "2799012",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "18",
        TRANSACTION_TYPE_NAME: "PO Receipt",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/1/20 15:19",
        M_QTY: "-2168",
        M_QTY_RM: "999",
        M_ID: "54916843",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "7/6/21 17:03",
        M_QTY: "-12",
        M_QTY_RM: "999",
        M_ID: "134598397",
        M_SOURCE_ID: "11259123",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "2/23/23 13:42",
        M_QTY: "-3000",
        M_QTY_RM: "999",
        M_ID: "261711788",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "12/12/23 17:11",
        M_QTY: "380",
        M_ID: "325369529",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/24/19 14:53",
        M_QTY: "-3000",
        M_ID: "3242926",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "PP>PL",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "2/4/20 10:58",
        M_QTY: "-12",
        M_ID: "35526219",
        M_SOURCE_ID: "6151891",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "5/19/20 9:10",
        M_QTY: "-8",
        M_ID: "53095236",
        M_SOURCE_ID: "7561247",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "8/3/20 10:49",
        M_QTY: "-12",
        M_ID: "63676844",
        M_SOURCE_ID: "8027970",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "8/11/21 14:24",
        M_QTY: "1500",
        M_ID: "141276669",
        M_SOURCE_ID: "12647039",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "18",
        TRANSACTION_TYPE_NAME: "PO Receipt",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "1/10/22 19:31",
        M_QTY: "-12",
        M_ID: "170334050",
        M_SOURCE_ID: "12879106",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/13/19 18:40",
        M_QTY: "-4",
        M_ID: "1325774",
        M_SOURCE_ID: "104627",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "8/6/19 13:54",
        M_QTY: "-24",
        M_ID: "9347817",
        M_SOURCE_ID: "1616365",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "9/20/19 11:14",
        M_QTY: "-48",
        M_ID: "15875726",
        M_SOURCE_ID: "2655807",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "10/1/19 17:00",
        M_QTY: "500",
        M_ID: "17675980",
        M_SOURCE_ID: "2799012",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "18",
        TRANSACTION_TYPE_NAME: "PO Receipt",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "12/3/19 14:23",
        M_QTY: "-24",
        M_ID: "26222761",
        M_SOURCE_ID: "4369805",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "1/28/20 10:27",
        M_QTY: "-12",
        M_ID: "34312870",
        M_SOURCE_ID: "5896865",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "12/18/20 11:53",
        M_QTY: "-12",
        M_ID: "93341823",
        M_SOURCE_ID: "9793076",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "12/12/23 17:11",
        M_QTY: "-380",
        M_ID: "325369528",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "12/26/23 9:53",
        M_QTY: "-24",
        M_ID: "328043561",
        M_SOURCE_ID: "22491491",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "7/22/24 10:14",
        M_QTY: "0",
        M_ID: "363523950",
        M_SOURCE_ID: "21505349",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "24",
        TRANSACTION_TYPE_NAME: "Standard cost update",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/18/19 14:31",
        M_QTY: "-10",
        M_ID: "2141791",
        M_SOURCE_ID: "169606",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/14/22 9:02",
        M_QTY: "-24",
        M_ID: "203582268",
        M_SOURCE_ID: "14476154",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "10/25/22 13:55",
        M_QTY: "-24",
        M_ID: "234173794",
        M_SOURCE_ID: "15898369",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "10/19/23 7:29",
        M_QTY: "-24",
        M_ID: "313791149",
        M_SOURCE_ID: "21107527",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "3/17/20 10:36",
        M_QTY: "-12",
        M_ID: "43651312",
        M_SOURCE_ID: "6930863",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "11/24/20 11:26",
        M_QTY: "-12",
        M_ID: "87974314",
        M_SOURCE_ID: "9537946",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "3/29/21 10:43",
        M_QTY: "-12",
        M_ID: "113389442",
        M_SOURCE_ID: "10253091",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/4/21 8:25",
        M_QTY: "-12",
        M_ID: "127449364",
        M_SOURCE_ID: "10970968",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "8/30/22 9:42",
        M_QTY: "-24",
        M_ID: "221009451",
        M_SOURCE_ID: "14810110",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "3/29/24 10:40",
        M_QTY: "-24",
        M_ID: "345689720",
        M_SOURCE_ID: "24105505",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/14/19 13:13",
        M_QTY: "-10",
        M_ID: "1474980",
        M_SOURCE_ID: "104774",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "9/12/19 8:36",
        M_QTY: "-48",
        M_ID: "14425902",
        M_SOURCE_ID: "2508809",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "6/1/20 15:19",
        M_QTY: "2168",
        M_ID: "54916844",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140700",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "RP-B-MAT",
        M_DATE: "2/21/22 17:08",
        M_QTY: "-12",
        M_ID: "179076396",
        M_SOURCE_ID: "13468157",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140704",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "NMP-B-MAT",
        M_DATE: "5/6/22 15:28",
        M_QTY: "-24",
        M_ID: "195036992",
        M_SOURCE_ID: "14059124",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140704",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "NMP-B-MAT",
        M_DATE: "7/21/22 8:15",
        M_QTY: "-1500",
        M_ID: "211398712",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "2",
        TRANSACTION_TYPE_NAME: "Subinventory Transfer",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140704",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "SSP-B-MAT",
        M_DATE: "5/31/19",
        M_QTY: "442",
        M_ID: "87373",
        M_SOURCE_ID: "",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "440",
        TRANSACTION_TYPE_NAME: "R12 Data Conversion",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
      {
        M_PART_NUMBER: "9091140704",
        M_PART_DESCRIPTION: 'NUT PROJECT.""D""M.10X1.25',
        M_SUBINV: "SSP-B-MAT",
        M_DATE: "8/20/21 13:56",
        M_QTY: "-12",
        M_ID: "142741243",
        M_SOURCE_ID: "11474235",
        M_SOURCE_NAME: "",
        M_SOURCE_LINE_ID: "",
        M_TYPE_ID: "35",
        TRANSACTION_TYPE_NAME: "WIP Issue",
        M_PART_IMG: "/img/Product/product_img1.png",
      },
    ]);
  }),
];