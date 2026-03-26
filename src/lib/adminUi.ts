import { format } from "date-fns";

export const parseIsoDateOnly = (value: string) => new Date(`${value}T00:00:00`);

export const formatAdminDate = (value: string) => format(parseIsoDateOnly(value), "d MMM yyyy");

export const formatAdminMonthYear = (value: string) => format(parseIsoDateOnly(value), "MMM yyyy");

export const getOrderStatusClasses = (status: string) => {
  if (status === "Delivered") {
    return "bg-green-50 text-green-700";
  }

  if (status === "Shipped") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
};
