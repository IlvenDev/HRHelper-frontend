import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/pl"; // Polish locale support
import type { HoursSummary } from "../types/dashboardDTO";
import type { EmployeeBasicResponse, EmployeeDetailResponse } from "../types/profilesDTO";
import "../fonts/DejaVuSans-normal.js"; // musisz wyeksportować jako js
import type { AttendanceTimeResponse } from "../types/attendanceDTO.js";
import type { LeaveResponse } from "../types/leavesDTO.js";


export const downloadMonthlyPersonalSummaryPdf = (
  employee: EmployeeBasicResponse,
  summary: HoursSummary,
  year: number,
  month: number
) => {
  const doc = new jsPDF();
  dayjs.locale("pl");

    const fullName = `${employee.name} ${employee.lastname}`;
    const paddedMonth = String(month).padStart(2, "0");
    const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY"); // np. "czerwiec 2024"

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(16);
    doc.text(`Raport sumaryczny - ${fullName}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Okres: ${monthName}`, 14, 28);


  // Dane
  const rows = [
    ["Suma", Object.values(summary).reduce((sum, val) => sum + val, 0)],
    ["Normalne", summary.regular],
    ["Nadgodziny dzienne", summary.overtimeDay],
    ["Nadgodziny nocne", summary.overtimeNight],
    ["Nadgodziny świąteczne", summary.overtimeHoliday],
    ["Urlop wypoczynkowy", summary.leaveVacation],
    ["Urlop okolicznościowy", summary.leaveCircumstance],
    ["Urlop szkoleniowy", summary.leaveTraining],
    ["Urlop chorobowy", summary.sickLeave],
    ["Urlop bezpłatny", summary.leaveUnpaid],
    ["Urlop wychowawczy", summary.leaveParental],
    ["Urlop macierzyński", summary.leavePregnant],
    ["Urlop na poszukiwanie pracy", summary.leaveJobSearch],
    ["Oddanie krwi", summary.leaveBlood],
    ["Siła wyższa", summary.leaveHigherPower],
    ["Opiekuńczy", summary.leaveCarer],
  ];

  // Dodanie tabeli
  autoTable(doc, {
    startY: 36,
    head: [["Rodzaj", "Liczba godzin"]],
    body: rows.map(([label, value]) => [label, value]),
    styles: {
      font: "DejaVuSans",
      fontSize: 11,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [41, 128, 185], // Niebieski
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });

  // Zapis PDF
  doc.save(`raport-${fullName}-${monthName}.pdf`);
};

export const downloadMonthlySummaryPdf = (
  summary: HoursSummary,
  year: number,
  month: number
) => {
  const doc = new jsPDF();
  dayjs.locale("pl");

    // const fullName = `${employee.name} ${employee.lastname}`;
    const paddedMonth = String(month).padStart(2, "0");
    const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY"); // np. "czerwiec 2024"

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(16);
    doc.text(`Ogólny raport sumaryczny `, 14, 20);
    doc.setFontSize(12);
    doc.text(`Okres: ${monthName}`, 14, 28);


  // Dane
  const rows = [
    ["Suma", Object.values(summary).reduce((sum, val) => sum + val, 0)],
    ["Normalne", summary.regular],
    ["Nadgodziny dzienne", summary.overtimeDay],
    ["Nadgodziny nocne", summary.overtimeNight],
    ["Nadgodziny świąteczne", summary.overtimeHoliday],
    ["Urlop wypoczynkowy", summary.leaveVacation],
    ["Urlop okolicznościowy", summary.leaveCircumstance],
    ["Urlop szkoleniowy", summary.leaveTraining],
    ["Urlop chorobowy", summary.sickLeave],
    ["Urlop bezpłatny", summary.leaveUnpaid],
    ["Urlop wychowawczy", summary.leaveParental],
    ["Urlop macierzyński", summary.leavePregnant],
    ["Urlop na poszukiwanie pracy", summary.leaveJobSearch],
    ["Oddanie krwi", summary.leaveBlood],
    ["Siła wyższa", summary.leaveHigherPower],
    ["Opiekuńczy", summary.leaveCarer],
  ];

  // Dodanie tabeli
  autoTable(doc, {
    startY: 36,
    head: [["Rodzaj", "Liczba godzin"]],
    body: rows.map(([label, value]) => [label, value]),
    styles: {
      font: "DejaVuSans",
      fontSize: 11,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [41, 128, 185], // Niebieski
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });

  // Zapis PDF
  doc.save(`raport-summaryczny-ogólny-${monthName}.pdf`);
};

const FULL_DAY_HOURS = 8;
const BREAK_HOURS = 0.25; // 15 min

function calculateHours(startTime: string, endTime: string, breakTaken: boolean, date: string): number {
    // Łączymy datę i czas w formacie YYYY-MM-DDTHH:mm
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
  
    let diffH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (breakTaken) diffH -= BREAK_HOURS;
  
    return Math.max(diffH, 0);
  }
  

interface DayReport {
date: string;
type: "Praca" | "Urlop";
workedHours?: number;
overtimeHours?: number;
leaveType?: string;
overtimeType?: "Nadgodziny dzienne" | "Nadgodziny nocne" | "Nadgodziny świąteczne";
}

import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import plHolidays from "date-holidays";
import { getPersonalSummary } from "../services/dashboardService.js";
import { getAttendanceByEmployeeAndDateRange } from "../services/attendanceService.js";
import { getLeavesByParams } from "../services/leavesService.js";

dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(localeData);

const holidays = new plHolidays("PL");

function isHolidayOrSunday(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date.getDay() === 0 || holidays.isHoliday(date);
}

function isNightWork(startTime: string, endTime: string): boolean {
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);
  return startH >= 22 || endH < 6;
}

  
function createChronologicalReport(
  attendances: AttendanceTimeResponse[],
  leaves: LeaveResponse[],
  fullDayHours = FULL_DAY_HOURS
): DayReport[] {
  const reportMap = new Map<string, DayReport>();

  // Urlopy mają priorytet, dlatego najpierw je dodajemy
  for (const leave of leaves) {
    let current = new Date(leave.dataStart);
    const end = new Date(leave.dataKoniec);

    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      reportMap.set(dateStr, {
        date: dateStr,
        type: "Urlop",
        workedHours: fullDayHours,
        leaveType: leave.rodzaj,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  // Następnie dodajemy obecności tylko jeśli nie ma urlopu w danym dniu
  for (const att of attendances) {
    const date = att.date;

    if (!reportMap.has(date)) {
        const workedHours = att.endTime
          ? calculateHours(att.startTime, att.endTime, att.breakTaken, att.date)
          : 0;
      
        let overtime = 0;
        let regular = workedHours;
        let overtimeType: DayReport["overtimeType"] | undefined;
      
        if (workedHours > fullDayHours) {
          overtime = workedHours - fullDayHours;
          regular = fullDayHours;
      
          if (isHolidayOrSunday(date)) {
            overtimeType = "Nadgodziny świąteczne";
          } else if (isNightWork(att.startTime, att.endTime!)) {
            overtimeType = "Nadgodziny nocne";
          } else {
            overtimeType = "Nadgodziny dzienne";
          }
        }
      
        reportMap.set(date, {
          date,
          type: "Praca",
          workedHours: regular,
          overtimeHours: overtime,
          overtimeType,
        });
      }
      
  }

  return Array.from(reportMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export const downloadDetailedDailyReportPdf = (
  employee: EmployeeBasicResponse,
  attendances: AttendanceTimeResponse[],
  leaves: LeaveResponse[],
  year: number,
  month: number
) => {
  const doc = new jsPDF();
  dayjs.locale("pl");
  const fullName = `${employee.name} ${employee.lastname}`;
  const paddedMonth = String(month).padStart(2, "0");
  const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY");

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(16);
  doc.text(`Raport chronologiczny - ${fullName}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Okres: ${monthName}`, 14, 28);

  const report = createChronologicalReport(attendances, leaves);

  const rows = report.map((day) => [
    day.date,
    day.type,
    day.workedHours?.toFixed(0) || "",
    day.overtimeHours?.toFixed(0) || "",
    day.leaveType || "",
    day.overtimeType || "",
  ]);
  
  autoTable(doc, {
    startY: 36,
    head: [["Data", "Typ", "Godziny pracy", "Nadgodziny", "Typ urlopu", "Typ nadgodzin"]],
    body: rows,
    styles: { font: "DejaVuSans", fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });
  
  doc.save(`raport-chronologiczny-${fullName}-${monthName}.pdf`);
};

export const appendMonthlyPersonalSummaryPdfToDoc = (
  doc: jsPDF,
  employee: EmployeeBasicResponse,
  summary: HoursSummary,
  year: number,
  month: number,
  addNewPage = true
) => {
  if (addNewPage) doc.addPage();

  dayjs.locale("pl");

  const fullName = `${employee.name} ${employee.lastname}`;
  const paddedMonth = String(month).padStart(2, "0");
  const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY");

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(16);
  doc.text(`Raport sumaryczny - ${fullName}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Okres: ${monthName}`, 14, 28);

  const rows = [
    ["Suma", Object.values(summary).reduce((sum, val) => sum + val, 0)],
    ["Normalne", summary.regular],
    ["Nadgodziny dzienne", summary.overtimeDay],
    ["Nadgodziny nocne", summary.overtimeNight],
    ["Nadgodziny świąteczne", summary.overtimeHoliday],
    ["Urlop wypoczynkowy", summary.leaveVacation],
    ["Urlop okolicznościowy", summary.leaveCircumstance],
    ["Urlop szkoleniowy", summary.leaveTraining],
    ["Urlop chorobowy", summary.sickLeave],
    ["Urlop bezpłatny", summary.leaveUnpaid],
    ["Urlop wychowawczy", summary.leaveParental],
    ["Urlop macierzyński", summary.leavePregnant],
    ["Urlop na poszukiwanie pracy", summary.leaveJobSearch],
    ["Oddanie krwi", summary.leaveBlood],
    ["Siła wyższa", summary.leaveHigherPower],
    ["Opiekuńczy", summary.leaveCarer],
  ];

  autoTable(doc, {
    startY: 36,
    head: [["Rodzaj", "Liczba godzin"]],
    body: rows.map(([label, value]) => [label, value]),
    styles: {
      font: "DejaVuSans",
      fontSize: 11,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });
};

export const generateAllMonthlyReportsForEmployees = async (
  employees: EmployeeBasicResponse[],
  year: number,
  month: number,
  holidays: string[] = []
) => {
  const doc = new jsPDF();
  dayjs.locale("pl");

  let isFirst = true;

  for (const employee of employees) {
    try {
      const summary = await getPersonalSummary(employee.id, year, month, holidays);

      appendMonthlyPersonalSummaryPdfToDoc(
        doc,
        employee,
        summary,
        year,
        month,
        !isFirst
      );

      isFirst = false;
    } catch (error) {
      console.error(`Błąd przy pracowniku ${employee.name} ${employee.lastname}:`, error);
    }
  }

  const paddedMonth = String(month).padStart(2, "0");
  const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY");

  doc.save(`raport-zbiorczy-${monthName}.pdf`);
};

// Zmodyfikowana wersja downloadDetailedDailyReportPdf, która działa na podanym doc i NIE zapisuje od razu PDF
const addDetailedDailyReportPage = (
  doc: jsPDF,
  employee: EmployeeBasicResponse,
  attendances: AttendanceTimeResponse[],
  leaves: LeaveResponse[],
  year: number,
  month: number,
  isFirstPage: boolean
) => {
  dayjs.locale("pl");
  const fullName = `${employee.name} ${employee.lastname}`;
  const paddedMonth = String(month).padStart(2, "0");
  const monthName = dayjs(`${year}-${paddedMonth}-01`).format("MMMM YYYY");

  if (!isFirstPage) {
    doc.addPage();
  }

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(16);
  doc.text(`Raport chronologiczny - ${fullName}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Okres: ${monthName}`, 14, 28);

  const report = createChronologicalReport(attendances, leaves);

  const rows = report.map((day) => [
    day.date,
    day.type,
    day.workedHours?.toFixed(0) || "",
    day.overtimeHours?.toFixed(0) || "",
    day.leaveType?.replace(/_/g, " ") || "",
    day.overtimeType || "",
  ]);

  autoTable(doc, {
    startY: 36,
    head: [["Data", "Typ", "Godziny pracy", "Nadgodziny", "Typ urlopu", "Typ nadgodzin"]],
    body: rows,
    styles: { font: "DejaVuSans", fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });
};

export const generateCompanyDetailedReportPdf = async (
  employees: EmployeeBasicResponse[],
  year: number,
  month: number
) => {
  const doc = new jsPDF();
  dayjs.locale("pl");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];

    const attendances = await getAttendanceByEmployeeAndDateRange(employee.id, startDateStr, endDateStr);
    const leaves = await getLeavesByParams(startDate, endDate, undefined, undefined, employee.id);
    const filteredLeaves = leaves.filter((leave) => leave.status !== "OCZEKUJĄCE");

    addDetailedDailyReportPage(doc, employee, attendances, filteredLeaves, year, month, i === 0);
  }

  const monthName = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
  doc.save(`raport-chronologiczny-wszystkich-${monthName}.pdf`);
};

